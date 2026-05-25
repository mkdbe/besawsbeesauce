import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, setAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  await setAdminSession()
  return NextResponse.json({ ok: true })
}
