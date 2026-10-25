// Attach the CP2.C "Hamlet's Advice pt. 3" recordings.
//
// The Drive doc's instruction is explicit: "Play the provided sound clip, then
// choose the correct transcription that matches the audio for the presented
// word." The distinctions being tested — tuɾɚ vs tutɚ, smuðnəs vs smuθnəs —
// can only be made by ear, so without the clips the questions are guesswork.
//
// Contrast 10C and CP1.E, whose clips exist but stay unattached: neither
// instruction asks for audio, and in both cases hearing the line would hand
// over the answer.
//
// The clips are numbered CP2.C.1 … CP2.C.6. As with 9C, the doc's six audio
// phrases are in the same order as the seed's six questions, and clip size
// tracks phrase length with no real inversion (the only out-of-order pair is
// two phrases of equal length). A listening pass is still worth doing.
//
// Idempotent. Run: node --env-file=.env scripts/add-cp2c-audio.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 38
const DIR = 'Checkpoint Exercise 2/C - Hamlet_s Advice pt. 3'

const INSTRUCTIONS =
  'Play the provided sound clip, then choose the correct transcription that ' +
  'matches the audio for the presented word.'

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const questions = data.Question.filter((q) => q.quizId === QUIZ_ID)

if (questions.length !== 6) {
  console.error(`expected 6 questions on quiz ${QUIZ_ID}, found ${questions.length} — aborting`)
  process.exit(1)
}

const failures = []
let attached = 0
let already = 0

for (const [i, q] of questions.entries()) {
  if (q.audioUrl) {
    already++
    continue
  }
  const key = `${DIR}/CP2.C.${i + 1}.mp3`
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (!h.ContentLength) failures.push(`zero-byte: ${key}`)
    else {
      q.audioUrl = toUrl(key)
      attached++
      console.log(`  CP2.C.${i + 1} -> ${q.text.slice(0, 60)}`)
    }
  } catch {
    failures.push(`missing on S3: ${key}`)
  }
}

if (failures.length) {
  console.error('REFUSING TO WRITE:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}

data.Quiz.find((q) => q.id === QUIZ_ID).instructions = INSTRUCTIONS

console.log(`\n${attached} clips attached · ${already} already had audio`)
if (DRY) console.log('--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('written')
}
