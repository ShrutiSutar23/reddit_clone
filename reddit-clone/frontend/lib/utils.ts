// ── Time formatting ───────────────────────────────────────────────────────
/**
 * Converts an ISO date string into a friendly relative time.
 * "just now" / "5 minutes ago" / "3 hours ago" / "2 days ago" / "May 3"
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now  = new Date()
  const secs = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secs < 60)                    return 'just now'
  if (secs < 3600)                  return `${Math.floor(secs / 60)} minutes ago`
  if (secs < 86400)                 return `${Math.floor(secs / 3600)} hours ago`
  if (secs < 604800)                return `${Math.floor(secs / 86400)} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── API error extraction ──────────────────────────────────────────────────
/**
 * Extracts a human-readable message from any axios error.
 * FastAPI returns errors as { detail: "..." }
 */
export function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const resp = (error as { response?: { data?: { detail?: string } } }).response
    if (resp?.data?.detail) return resp.data.detail
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

// ── Vote count display ────────────────────────────────────────────────────
/**
 * Formats vote count for compact display.
 * 1234 → "1.2k"
 */
export function formatVoteCount(count: number): string {
  if (count >= 1000)  return `${(count / 1000).toFixed(1)}k`
  if (count <= -1000) return `-${(Math.abs(count) / 1000).toFixed(1)}k`
  return count.toString()
}

// ── LocalStorage helpers (safe – won't crash during SSR) ─────────────────
export const storage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
}
