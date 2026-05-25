'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function TrackingScript() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return

    let sid = sessionStorage.getItem('beesauce_sid')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('beesauce_sid', sid)
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, path: pathname, referer: document.referrer || 'Direct' }),
    }).catch(() => {})

    const heartbeat = setInterval(() => {
      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      }).catch(() => {})
    }, 10000)

    const handleClick = () => {
      fetch('/api/track-nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      }).catch(() => {})
    }
    document.addEventListener('click', handleClick)

    return () => {
      clearInterval(heartbeat)
      document.removeEventListener('click', handleClick)
    }
  }, [pathname])

  return null
}
