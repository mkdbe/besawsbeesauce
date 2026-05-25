import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readAnalytics } from '@/lib/analytics'

export async function GET(_req: NextRequest) {
  const jar = await cookies()
  if (!jar.get('admin_session')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(readAnalytics())
}
