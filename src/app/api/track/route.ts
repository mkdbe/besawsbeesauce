import { NextRequest, NextResponse } from 'next/server'
import { readAnalytics, writeAnalytics, parseVisitorInfo } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, path: pagePath, referer } = await req.json()
    if (!sessionId) return NextResponse.json({ ok: true })

    const { ip, ua, device, browser, os, location } = parseVisitorInfo(req)
    const data = readAnalytics()
    const visit = data.visits.find((v) => v.sessionId === sessionId)

    if (visit) {
      if (!visit.pages.includes(pagePath)) visit.pages.push(pagePath)
    } else {
      data.visits.push({
        sessionId,
        timestamp: new Date().toISOString(),
        path: pagePath,
        pages: [pagePath],
        ip,
        location,
        userAgent: ua,
        device,
        browser,
        os,
        referer: referer || 'Direct',
        navigations: 0,
        duration: 0,
        lastHeartbeat: new Date().toISOString(),
      })
    }

    writeAnalytics(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
