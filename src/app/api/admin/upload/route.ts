import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { processUploadedImage } from '@/lib/image-process'

const MAX_SIZE = 8 * 1024 * 1024

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 8 MB)' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const stem = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const tempFilename = `${stem}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  await mkdir(uploadDir, { recursive: true })
  const tempPath = path.join(uploadDir, tempFilename)
  await writeFile(tempPath, Buffer.from(await file.arrayBuffer()))

  // Optimize + create mobile variant in background (does not block response)
  processUploadedImage(tempPath).catch((err) => console.error('image-process error:', err))

  return NextResponse.json({ url: `/api/uploads/${stem}.webp` })
}
