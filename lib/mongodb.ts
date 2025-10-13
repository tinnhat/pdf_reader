import { MongoClient } from "mongodb";
import { getEnvironment } from "@/lib/env";

/**
 * Shared MongoDB client with connection reuse. MongoDB's driver is designed to
 * be long-lived; keeping a singleton instance prevents us from exhausting the
 * connection pool when routes are invoked frequently.
 */
let mongoClient: MongoClient | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient) {
    return mongoClient;
  }

  if (!mongoClientPromise) {
    const { mongoUri } = getEnvironment();
    mongoClientPromise = MongoClient.connect(mongoUri, {
      monitorCommands: false,
    });
  }

  mongoClient = await mongoClientPromise;
  return mongoClient;
}

export async function getMongoDatabase() {
  const client = await getMongoClient();
  const { mongoDb } = getEnvironment();
  return client.db(mongoDb);
}
