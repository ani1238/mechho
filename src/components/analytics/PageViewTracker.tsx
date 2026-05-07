'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getSessionId } from '@/lib/session'

export default function PageViewTracker() {
  const pathname = usePathname()
  const tracked = useRef('')

  useEffect(() => {
    if (pathname === tracked.current) return
    tracked.current = pathname
    const sid = getSessionId()
    if (!sid) return
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page_view', session_id: sid, page: pathname }),
    }).catch(() => {})
  }, [pathname])

  return null
}
