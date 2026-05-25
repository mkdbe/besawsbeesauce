import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params
  const filename = parts.join('/')
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
  try {
    const file = await readFile(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    return new NextResponse(file, {
      headers: {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=2592000',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
