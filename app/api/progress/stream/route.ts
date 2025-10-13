import { NextRequest } from "next/server";
import { ChangeStreamDocument } from "mongodb";
import { DEMO_USER_ID, COLLECTIONS } from "@/lib/constants";
import { getMongoDatabase } from "@/lib/mongodb";
import { mapChangeStreamDocument } from "@/lib/repositories/progressRepository";
import { ReadingProgress } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveUserId(request: NextRequest, explicitUserId?: string | null) {
  return explicitUserId ?? request.headers.get("x-user-id") ?? DEMO_USER_ID;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) {
    return new Response(JSON.stringify({ error: "documentId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = resolveUserId(request, searchParams.get("userId"));

  try {
    const db = await getMongoDatabase();
    const collection = db.collection<ReadingProgress>(COLLECTIONS.progress);
    const changeStream = collection.watch(
      [
        {
          $match: {
            "fullDocument.userId": userId,
            "fullDocument.documentId": documentId,
          },
        },
      ],
      { fullDocument: "updateLookup" }
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const pushEvent = (
          change: ChangeStreamDocument<ReadingProgress>
        ) => {
          if (!change.fullDocument) return;
          const payload = mapChangeStreamDocument(change.fullDocument);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        changeStream.on("change", pushEvent);
        changeStream.on("error", (error) => controller.error(error));

        const closeStream = () => {
          changeStream.removeListener("change", pushEvent);
          changeStream.close().catch(() => void 0);
        };

        request.signal.addEventListener("abort", closeStream, { once: true });
      },
      cancel() {
        changeStream.close().catch(() => void 0);
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Failed to start change stream", error);
    return new Response(
      JSON.stringify({
        error:
          "Unable to open MongoDB change stream. Ensure your deployment runs as a replica set.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
