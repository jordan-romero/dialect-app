// Server-side S3 presigning (dependency-free AWS SigV4).
//
// Content (videos, handouts, audio) lives in a PRIVATE S3 bucket. The DB still
// stores canonical S3 URLs, but those are never handed to the browser directly.
// The content API routes pass their JSON through `signDeep`, which replaces
// every S3 URL with a short-lived presigned URL generated with the server's
// AWS credentials. Anonymous users cannot read the bucket, and signed links
// expire (default 1 hour).
//
// We sign manually with node:crypto rather than the AWS SDK to avoid the SDK's
// heavy/duplicated dependency tree in the Next.js server bundle.

import crypto from 'crypto'

const region = process.env.AWS_REGION || 'us-east-1'
const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''
const DEFAULT_TTL = 60 * 60 // seconds

const host = `${Bucket}.s3.${region}.amazonaws.com`

function sha256hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}
function hmac(key: crypto.BinaryLike | Buffer, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}
// RFC3986 encoding (encodeURIComponent + the extra reserved chars S3 expects)
function enc(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  )
}
// Encode an object key for the URL path, preserving '/'.
function encodeKey(key: string): string {
  return key.split('/').map(enc).join('/')
}

function isOurS3Url(value: string): boolean {
  try {
    return new URL(value).host.startsWith(`${Bucket}.s3`)
  } catch {
    return false
  }
}

// Stored URLs use form-style encoding ('+' = space) plus %XX escapes.
export function s3KeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.host.startsWith(`${Bucket}.s3`)) return null
    return decodeURIComponent(
      u.pathname.replace(/^\//, '').replace(/\+/g, '%20'),
    )
  } catch {
    return null
  }
}

export function presignKey(
  key: string,
  expiresIn: number = DEFAULT_TTL,
): string {
  const now = new Date()
  const amzDate = now
    .toISOString()
    .replace(/[:-]/g, '')
    .replace(/\.\d{3}/, '') // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8)
  const scope = `${dateStamp}/${region}/s3/aws4_request`
  const canonicalUri = '/' + encodeKey(key)

  const query: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', enc(`${accessKeyId}/${scope}`)],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(expiresIn)],
    ['X-Amz-SignedHeaders', 'host'],
  ]
  const canonicalQuery = query
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256hex(canonicalRequest),
  ].join('\n')

  let signingKey = hmac(`AWS4${secretAccessKey}`, dateStamp)
  signingKey = hmac(signingKey, region)
  signingKey = hmac(signingKey, 's3')
  signingKey = hmac(signingKey, 'aws4_request')
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(stringToSign, 'utf8')
    .digest('hex')

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`
}

export function signS3Url(
  url: string,
  expiresIn: number = DEFAULT_TTL,
): string {
  const key = s3KeyFromUrl(url)
  if (!key) return url // external / non-bucket URL — leave untouched
  if (!accessKeyId || !secretAccessKey) return url
  try {
    return presignKey(key, expiresIn)
  } catch (e) {
    console.error('Failed to presign S3 url:', url, e)
    return url
  }
}

// Recursively walk an API payload and presign any S3 URL strings in place.
// Safe for plain JSON / Prisma rows (guards Date and null).
export function signDeep<T>(data: T, expiresIn: number = DEFAULT_TTL): T {
  if (data == null) return data
  if (data instanceof Date) return data
  if (Array.isArray(data)) {
    return data.map((item) => signDeep(item, expiresIn)) as unknown as T
  }
  if (typeof data === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      out[k] = signDeep(v, expiresIn)
    }
    return out as unknown as T
  }
  if (typeof data === 'string' && isOurS3Url(data)) {
    return signS3Url(data, expiresIn) as unknown as T
  }
  return data
}
