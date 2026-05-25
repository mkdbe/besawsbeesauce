'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminNav from '@/components/admin/AdminNav'

interface Visit {
  sessionId: string
  timestamp: string
  path: string
  pages: string[]
  ip: string
  location: string
  device: string
  browser: string
  os: string
  referer: string
  navigations: number
  duration: number
}

function isHuman(v: Visit) {
  if (/rochester/i.test(v.location || '')) return true
  return (v.duration || 0) >= 30 && (v.navigations || 0) >= 1
}

function getSource(v: Visit) {
  const r = v.referer || ''
  if (!r || r === 'Direct') return 'Direct'
  if (/google/i.test(r)) return 'Google'
  if (/bing/i.test(r)) return 'Bing'
  if (/facebook|fb\.com/i.test(r)) return 'Facebook'
  if (/instagram/i.test(r)) return 'Instagram'
  if (/twitter|x\.com|t\.co/i.test(r)) return 'Twitter/X'
  if (/pinterest/i.test(r)) return 'Pinterest'
  try { return new URL(r).hostname.replace('www.', '') } catch { return 'Other' }
}

function fmtDur(s: number) {
  if (!s) return '0:00'
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce((a, v) => {
    const k = String(v[key] || 'Unknown')
    a[k] = (a[k] || 0) + 1
    return a
  }, {} as Record<string, number>)
}

function BarChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return <div style={{ color: 'var(--dim)', fontSize: 12, fontStyle: 'italic' }}>no data</div>
  return (
    <>{sorted.map(([label, n]) => {
      const pct = total > 0 ? Math.round((n / total) * 100) : 0
      return (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, opacity: 0.75 }}>{label}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{n} <span style={{ opacity: 0.4 }}>{pct}%</span></span>
          </div>
          <div style={{ height: 2, background: 'var(--border2)', borderRadius: 1 }}>
            <div style={{ height: 2, width: `${pct}%`, background: 'var(--accent)', borderRadius: 1 }} />
          </div>
        </div>
      )
    })}</>
  )
}

export default function AnalyticsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showBots, setShowBots] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setVisits(data.visits || [])
      setLastUpdated(new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }) + ' EST')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const allVisits = visits
  const humanCount = allVisits.filter(isHuman).length
  const botCount = allVisits.length - humanCount
  const filtered = showBots ? allVisits : allVisits.filter(isHuman)
  const total = filtered.length
  const now = Date.now()

  const last24h = filtered.filter(v => now - new Date(v.timestamp).getTime() < 864e5).length
  const last7d = filtered.filter(v => now - new Date(v.timestamp).getTime() < 7 * 864e5).length
  const bounced = filtered.filter(v => (!v.navigations || v.navigations === 0) && (!v.duration || v.duration < 10)).length
  const bounceRate = total > 0 ? Math.round((bounced / total) * 100) : 0
  const withDur = filtered.filter(v => v.duration > 0)
  const avgDur = withDur.length ? Math.floor(withDur.reduce((s, v) => s + v.duration, 0) / withDur.length) : 0

  const devices = countBy(filtered, 'device')
  const browsers = countBy(filtered, 'browser')
  const oses = countBy(filtered, 'os')
  const sources = filtered.reduce((a, v) => { const s = getSource(v); a[s] = (a[s] || 0) + 1; return a }, {} as Record<string, number>)
  const locs = countBy(filtered, 'location')

  const pageCounts: Record<string, number> = {}
  filtered.forEach(v => (v.pages || [v.path]).forEach(p => { pageCounts[p] = (pageCounts[p] || 0) + 1 }))
  const topPagesTotal = Object.values(pageCounts).reduce((a, b) => a + b, 0) || 1

  const dayKeys: string[] = [], dayLabels: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayKeys.push(d.toISOString().slice(0, 10))
    dayLabels.push(i === 0 ? 'today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  }
  const dayCounts: Record<string, number> = {}
  dayKeys.forEach(k => { dayCounts[k] = 0 })
  filtered.forEach(v => { const k = new Date(v.timestamp).toISOString().slice(0, 10); if (k in dayCounts) dayCounts[k]++ })
  const sparkVals = dayKeys.map(k => dayCounts[k])
  const sparkMax = Math.max(...sparkVals, 1)

  const recent = filtered.slice(-50).reverse()

  if (loading) return (
    <>
      <AdminNav />
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#888', padding: '80px 0', textAlign: 'center' }}>loading…</div>
    </>
  )

  const css = `
    :root {
      --bg: #0c0c0b; --surface: #111110;
      --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.04);
      --text: #f0ebe0; --muted: #f0ebe0; --dim: rgba(240,235,224,0.55);
      --accent: #d97706;
      --mono: 'DM Mono', monospace; --sans: 'DM Sans', sans-serif;
    }
  `

  return (
    <>
      <AdminNav />
      <style>{css}</style>
      <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: 'calc(100vh - 48px)', fontFamily: 'var(--sans, sans-serif)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 32px 80px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.04em' }}>besaw&apos;s bee sauce</span>
              <span style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 13 }}>/</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.04em' }}>analytics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>
                {showBots ? `${allVisits.length} total · ${humanCount} humans · ${botCount} bots` : `${humanCount} humans · ${botCount} bots filtered`}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>{lastUpdated}</span>
              <button onClick={() => setShowBots(b => !b)} style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '5px 14px', cursor: 'pointer', letterSpacing: '0.06em' }}>
                {showBots ? 'hide bots' : 'show bots'}
              </button>
              <button onClick={load} style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '5px 14px', cursor: 'pointer', letterSpacing: '0.06em' }}>↺ refresh</button>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', marginBottom: 20 }}>
            {[
              { value: total, label: showBots ? 'Total Visits' : 'Human Visits', sub: !showBots ? '' : `${humanCount} humans · ${botCount} bots` },
              { value: last24h, label: 'Last 24h' },
              { value: last7d, label: 'Last 7 Days' },
              { value: `${bounceRate}%`, label: 'Bounce Rate', sub: `avg ${fmtDur(avgDur)} on site` },
            ].map((kpi, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '24px 22px 20px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 38, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>{kpi.value}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{kpi.label}</div>
                {kpi.sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>{kpi.sub}</div>}
              </div>
            ))}
          </div>

          {/* Sparkline */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 22px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>Daily visits — last 14 days</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)' }}>{dayKeys[0]} → {dayKeys[13]}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
              {sparkVals.map((n, i) => (
                <div key={i} title={`${dayLabels[i]}: ${n}`} style={{
                  flex: 1, borderRadius: 2, minHeight: 2,
                  height: Math.max(2, Math.round((n / sparkMax) * 48)),
                  background: n > 0 ? 'var(--accent)' : 'var(--border2)',
                  opacity: n > 0 ? Math.max(0.25, n / sparkMax) : 0.12,
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          </div>

          {/* Breakdown cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
            {[
              { title: 'Device', counts: devices },
              { title: 'Browser', counts: browsers },
              { title: 'OS', counts: oses },
              { title: 'Source', counts: sources },
            ].map(({ title, counts }) => (
              <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 18px 14px' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border2)' }}>{title}</div>
                <BarChart counts={counts} total={total} />
              </div>
            ))}
          </div>

          {/* Locations + Pages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 18px 14px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border2)' }}>Top Locations</div>
              {(() => {
                const topLocs = Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 8)
                const maxLoc = topLocs[0]?.[1] || 1
                return !topLocs.length
                  ? <div style={{ color: 'var(--dim)', fontSize: 12, fontStyle: 'italic' }}>no data</div>
                  : topLocs.map(([loc, n], i) => (
                    <div key={loc} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: i < topLocs.length - 1 ? '1px solid var(--border2)' : 'none' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)', width: 18 }}>{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 300, opacity: 0.8, flex: 1, padding: '0 8px 0 4px' }}>{loc}</span>
                      <div style={{ flex: '0 0 80px', height: 2, background: 'var(--border2)', borderRadius: 1 }}>
                        <div style={{ height: 2, width: `${Math.round((n / maxLoc) * 100)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', width: 22, textAlign: 'right' }}>{n}</span>
                    </div>
                  ))
              })()}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 18px 14px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border2)' }}>Top Pages</div>
              <BarChart counts={Object.fromEntries(Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8))} total={topPagesTotal} />
            </div>
          </div>

          {/* Recent visits table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>Recent Visits</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)' }}>last {recent.length}</span>
            </div>
            <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {['Time (EST)', 'IP', 'Location', 'Device', 'Browser', 'Duration', 'Clicks', 'Pages Visited', 'Source', 'Type'].map(h => (
                      <th key={h} style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', padding: '9px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!recent.length ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--dim)', fontStyle: 'italic', fontFamily: 'var(--mono)', fontSize: 12 }}>no visits yet</td></tr>
                  ) : recent.map((v, idx) => {
                    const est = new Date(v.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    const human = isHuman(v)
                    const pages = v.pages || [v.path]
                    const td = (content: React.ReactNode, bright = false) => (
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 12px', color: bright ? 'var(--text)' : 'var(--dim)', whiteSpace: 'nowrap' }}>{content}</td>
                    )
                    const chipStyle = (color: string): React.CSSProperties => ({ display: 'inline-block', fontSize: 10, padding: '2px 6px', border: `1px solid ${color}`, color: color })
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border2)' }}>
                        {td(est, true)}
                        {td(v.ip || '—')}
                        {td(v.location || '—')}
                        {td(v.device || '—')}
                        {td(v.browser || '—')}
                        {td(fmtDur(v.duration || 0))}
                        {td(v.navigations || 0, true)}
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '8px 12px', color: 'var(--dim)', maxWidth: 200 }}>
                          {pages.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                              {i > 0 && <span style={{ color: 'var(--accent)', fontSize: 9 }}>→</span>}
                              <span style={{ color: i === 0 ? 'var(--text)' : 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p}</span>
                            </div>
                          ))}
                        </td>
                        {td(getSource(v))}
                        {td(<span style={chipStyle(human ? 'rgba(130,200,130,0.5)' : 'rgba(200,130,130,0.4)')}>{human ? '✓ human' : '✗ bot'}</span>)}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </>
  )
}
