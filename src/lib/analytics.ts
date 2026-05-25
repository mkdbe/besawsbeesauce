import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json')

export interface Visit {
  sessionId: string
  timestamp: string
  path: string
  pages: string[]
  ip: string
  location: string
  userAgent: string
  device: string
  browser: string
  os: string
  referer: string
  navigations: number
  duration: number
  lastHeartbeat: string
}

export interface AnalyticsData {
  visits: Visit[]
}

export function readAnalytics(): AnalyticsData {
  if (!existsSync(ANALYTICS_FILE)) return { visits: [] }
  try { return JSON.parse(readFileSync(ANALYTICS_FILE, 'utf8')) } catch { return { visits: [] } }
}

export function writeAnalytics(data: AnalyticsData) {
  mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true })
  writeFileSync(ANALYTICS_FILE, JSON.stringify(data))
}

export function parseVisitorInfo(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'Unknown'
  const ua = req.headers.get('user-agent') || ''

  let device = 'Desktop'
  if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile'
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet'

  let browser = 'Other'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera'
  else if (/Chrome/i.test(ua)) browser = 'Chrome'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Safari/i.test(ua)) browser = 'Safari'

  let os = 'Other'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let location = 'Unknown'
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const geoip = require('geoip-lite')
    const geo = geoip.lookup(ip)
    if (geo) {
      const parts: string[] = []
      if (geo.city) parts.push(geo.city)
      if (geo.region) parts.push(geo.region)
      if (geo.country) parts.push(geo.country)
      location = parts.join(', ') || 'Unknown'
    }
  } catch { /* geoip not available */ }

  return { ip, ua, device, browser, os, location }
}
