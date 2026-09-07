// Copy audio from Google Drive to the S3 bucket.
//
// A lot of the course's recordings exist in Drive but were never uploaded —
// several sets are on S3 only as one long combined MP3, which is why those
// exercises hand learners a single file to scrub through instead of a clip per
// question. This copies the split files across so they can be attached.
//
// Reads a manifest of { driveId, name, key, bytes } and for each entry:
//   1. skips it if the key already exists on S3 (never overwrites),
//   2. downloads from Drive and checks the byte count matches,
//   3. uploads, then re-reads the object's size to confirm.
//
// Nothing is uploaded unless the downloaded size matches Drive's exactly, so a
// truncated or HTML-error-page download can't be written over real audio.
//
// Run: node --env-file=.env scripts/drive-to-s3.mjs <manifest.json> [--dry-run]

import { readFileSync } from 'node:fs'
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'

const manifestPath = process.argv[2]
const DRY = process.argv.includes('--dry-run')
if (!manifestPath) {
  console.error('usage: drive-to-s3.mjs <manifest.json> [--dry-run]')
  process.exit(1)
}

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const entries = JSON.parse(readFileSync(manifestPath, 'utf-8'))

const contentTypeFor = (name) =>
  /\.wav$/i.test(name) ? 'audio/wav' : 'audio/mpeg'

const exists = async (Key) => {
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key }))
    return h.ContentLength ?? 0
  } catch (err) {
    // Only a genuine "not there" means we may upload. A transient network error
    // or an AccessDenied on an existing key must NOT be read as missing, or the
    // never-overwrite guarantee breaks and PutObject clobbers the object.
    const status = err?.$metadata?.httpStatusCode
    if (err?.name === 'NotFound' || err?.name === 'NoSuchKey' || status === 404) {
      return null
    }
    throw err
  }
}

let uploaded = 0
let skipped = 0
const failures = []

for (const e of entries) {
  const already = await exists(e.key)
  if (already !== null) {
    skipped++
    continue
  }

  let buf
  try {
    const res = await fetch(
      `https://drive.google.com/uc?export=download&id=${e.driveId}`,
      { redirect: 'follow' },
    )
    if (!res.ok) {
      failures.push(`${e.name}: download HTTP ${res.status}`)
      continue
    }
    buf = Buffer.from(await res.arrayBuffer())
  } catch (err) {
    failures.push(`${e.name}: download threw ${err.message}`)
    continue
  }

  // Drive serves an HTML interstitial instead of the file when it wants a
  // confirmation click. Matching the exact byte count rules that out.
  if (e.bytes && buf.length !== Number(e.bytes)) {
    failures.push(
      `${e.name}: size mismatch — Drive says ${e.bytes}, got ${buf.length}`,
    )
    continue
  }
  if (buf.length < 1000) {
    failures.push(`${e.name}: suspiciously small (${buf.length} bytes)`)
    continue
  }

  if (DRY) {
    console.log(`  would upload ${e.name} (${buf.length}B) -> ${e.key}`)
    uploaded++
    continue
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: e.key,
        Body: buf,
        ContentType: contentTypeFor(e.name),
      }),
    )
    const confirmed = await exists(e.key)
    if (confirmed !== buf.length) {
      failures.push(
        `${e.name}: uploaded but S3 reports ${confirmed} not ${buf.length}`,
      )
      continue
    }
    uploaded++
    console.log(`  ${e.name} -> ${e.key} (${buf.length}B)`)
  } catch (err) {
    failures.push(`${e.name}: upload failed ${err.message}`)
  }
}

console.log(
  `\n${
    DRY ? '[dry-run] ' : ''
  }uploaded ${uploaded} · already present ${skipped} · failed ${
    failures.length
  }`,
)
if (failures.length) {
  console.error('\nFAILURES:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}
