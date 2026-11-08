import { useCallback, useEffect, useState } from 'react'

export function useJson<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    if (!url) return
    setLoading(true)
    try {
      const r = await fetch(url)
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(j.error || `Request failed (${r.status})`)
        setData(null)
      } else {
        setError(null)
        setData(j)
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }, [url])
  useEffect(() => {
    reload()
  }, [reload])
  return { data, error, loading, reload }
}

export async function send(url: string, method: string, body?: unknown) {
  const r = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data: j as any }
}

export const money = (cents: number, currency = 'usd') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100)

export const shortDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

export function relative(iso: string | null | undefined): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86400000
  if (diff < 3600000) return 'Within the hour'
  if (diff < day) return 'Today'
  if (diff < 2 * day) return 'Yesterday'
  if (diff < 30 * day) return `${Math.floor(diff / day)} days ago`
  return shortDate(iso)
}

export function downloadText(
  filename: string,
  text: string,
  type = 'text/csv',
) {
  const blob = new Blob([text], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function csv(rows: (string | number | null)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = v === null || v === undefined ? '' : String(v)
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(','),
    )
    .join('\n')
}

export const teacherName = (
  t?: {
    firstName?: string | null
    lastName?: string | null
    email?: string
  } | null,
) =>
  t ? [t.firstName, t.lastName].filter(Boolean).join(' ') || t.email || '' : ''
