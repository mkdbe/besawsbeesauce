import { NextRequest, NextResponse } from 'next/server'
import { readAnalytics, writeAnalytics } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) return NextResponse.json({ ok: true })

    const data = readAnalytics()
    const visit = data.visits.find((v) => v.sessionId === sessionId)
    if (visit) {
      const now = new Date()
      const start = new Date(visit.timestamp)
      visit.duration = Math.floor((now.getTime() - start.getTime()) / 1000)
      visit.lastHeartbeat = now.toISOString()
      writeAnalytics(data)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
