import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllContent, setContent } from '@/lib/content'

async function checkAuth() {
  const jar = await cookies()
  return Boolean(jar.get('admin_session'))
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getAllContent())
}

export async function PUT(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  setContent(key, String(value ?? ''))
  return NextResponse.json({ ok: true })
}
