import { NextRequest } from 'next/server'
import { DEMO_USER_ID } from '@/lib/constants'
import { findStoredDocumentFile } from '@/lib/repositories/documentsRepository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function resolveUserId(request: NextRequest, explicitUserId?: string | null) {
  return explicitUserId ?? request.headers.get('x-user-id') ?? DEMO_USER_ID
}

export async function GET(request: NextRequest, context: any) {
  const { documentId } = context.params
  const userId = resolveUserId(request, request.nextUrl.searchParams.get('userId'))
  const document = await findStoredDocumentFile(userId, documentId)

  if (!document) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(new Uint8Array(document.data), {
    status: 200,
    headers: {
      'Content-Type': document.mimeType || 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(document.fileName)}"`,
      'Content-Length': String(document.data.byteLength ?? document.data.length),
      'Cache-Control': 'private, max-age=0, no-cache',
    },
  })
}
