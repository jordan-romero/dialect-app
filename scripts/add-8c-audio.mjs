// Attach the 8C Simple Transcription recordings, and give the exercise its
// instruction text.
//
// This exercise asks for audio explicitly. The Drive doc "8C - Simple
// Transcription" says "Click the word to hear it pronounced", and adds a note:
// "Each word should have a play button where they can hear it out loud." So
// unlike 8A — whose instruction never mentions audio, and where hearing
// "singing" would hand over the answer — playing the word here is the point:
// the learner still has to transcribe what they hear into IPA.
//
// The 19 clips are named by word (8C.dog.mp3 …) and map 1:1 onto the quiz's
// questions. ORANGE is the one word of 20 with no recording; it is listed
// below by name so a clip going missing later fails loudly instead of being
// quietly skipped.
//
// Idempotent. Run: node --env-file=.env scripts/add-8c-audio.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 25
const DIR = '8. Transcription Concepts/8C.Audio'
const KNOWN_MISSING = ['ORANGE'] // see docs/audio-still-needed.md

const INSTRUCTIONS =
  'Transcribe the following words into the IPA using the provided symbol ' +
  'bank. Click the word to hear it pronounced. Once you’re done, click ' +
  '“reveal answer.”'

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const questions = data.Question.filter((q) => q.quizId === QUIZ_ID)
if (!questions.length) {
  console.error(`no questions on quiz ${QUIZ_ID} — aborting`)
  process.exit(1)
}

const failures = []
let attached = 0
let already = 0

for (const q of questions) {
  if (q.audioUrl) {
    already++
    continue
  }
  const word = q.text.toLowerCase()
  const key = `${DIR}/8C.${word}.mp3`
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (!h.ContentLength) failures.push(`zero-byte: ${key}`)
    else {
      q.audioUrl = toUrl(key)
      attached++
    }
  } catch {
    if (KNOWN_MISSING.includes(q.text)) {
      console.log(`  ${q.text}: no recording yet (known)`)
    } else {
      failures.push(`missing on S3: ${key}`)
    }
  }
}

if (failures.length) {
  console.error('REFUSING TO WRITE — unexpected gaps:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}

const quiz = data.Quiz.find((q) => q.id === QUIZ_ID)
const setInstructions = quiz.instructions !== INSTRUCTIONS
quiz.instructions = INSTRUCTIONS

console.log(
  `\n${attached} clips attached · ${already} already had audio · ` +
    `${questions.length} questions total`,
)
if (setInstructions) console.log('instructions set from the Drive doc')

if (DRY) console.log('\n--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('\nwritten — run `yarn seed` to apply')
}
