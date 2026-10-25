// Attach the Build-a-Word recordings, and move its data behind a signing route.
//
// The Drive doc "d. EXERCISE - Build-a-Word" says "Record words for playback",
// and the ten CP1D.* clips on S3 are the result — but nothing referenced them.
// Unlike the "in Word Context" exercises, playing the word here doesn't give
// the answer away: the learner still has to transcribe it into IPA. The
// on-screen instruction is updated to mention the button (see
// HangmanIPAExercise), so the exercise says what it now offers.
//
// The data also moves from public/ to data/. A file in public/ is served
// straight off disk, so its S3 URLs would never be signed and every clip would
// 403 — the same trap as the 7B data.
//
// Idempotent. Run: node --env-file=.env scripts/add-buildaword-audio.mjs [--dry-run]

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OLD = join(__dirname, '..', 'public', 'buildAWordData.json')
const NEW = join(__dirname, '..', 'data', 'buildAWordData.json')
const DRY = process.argv.includes('--dry-run')

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const DIR = 'Checkpoint Exercise 1/D - Build-a-Word'

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

const source = existsSync(NEW) ? NEW : OLD
const data = JSON.parse(readFileSync(source, 'utf-8'))

const failures = []
let attached = 0
for (const q of data.questions_data) {
  if (q.audioUrl) continue
  // Clips are named by word with spaces stripped: "Pacific Ocean" -> PacificOcean
  const key = `${DIR}/CP1D.${q.word.replace(/\s+/g, '')}.mp3`
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (!h.ContentLength) failures.push(`zero-byte: ${key}`)
    else {
      q.audioUrl = toUrl(key)
      attached++
    }
  } catch (e) {
    failures.push(`${e.name}: ${key}`)
  }
}

if (failures.length) {
  console.error('REFUSING TO WRITE — missing audio:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}

console.log(
  `${attached} clips attached (${data.questions_data.length} words total)`,
)
if (DRY) {
  console.log('--dry-run: nothing written')
} else {
  writeFileSync(NEW, JSON.stringify(data, null, 2) + '\n')
  if (existsSync(OLD)) {
    unlinkSync(OLD)
    console.log('moved public/buildAWordData.json -> data/ (so it gets signed)')
  }
  console.log('written to data/buildAWordData.json')
}
