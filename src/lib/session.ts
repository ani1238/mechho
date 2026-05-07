const SESSION_KEY = 'mechho_sid'

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return ''
  }
}
