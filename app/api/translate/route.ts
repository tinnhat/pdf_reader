import { NextRequest, NextResponse } from 'next/server'
import { getEnvironment } from '@/lib/env'

const { translateUri } = getEnvironment()

export const runtime = 'nodejs'
export const revalidate = 0

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const { text, targetLanguage, sourceLanguage } = payload

  try {
    const apiUrl = `${translateUri}/api/v1/${
      sourceLanguage ?? 'auto'
    }/${targetLanguage}/${encodeURIComponent(text)}`
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`Lingva API failed: ${response.status}`)
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Translation request failed', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
