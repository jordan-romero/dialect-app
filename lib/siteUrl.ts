import type { NextApiRequest } from 'next'

// Absolute base URL for links in emails. Uses configured env, never the
// request's Host header in production (a forged Host would put an attacker's
// domain in a link we send).
export function siteUrl(req?: NextApiRequest): string {
  const configured = process.env.SITE_URL || process.env.AUTH0_BASE_URL
  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NODE_ENV !== 'production' && req?.headers.host) {
    return `http://${req.headers.host}`
  }
  return 'https://actingaccents.com'
}
