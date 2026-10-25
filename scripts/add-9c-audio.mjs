// Attach the 9C Descriptive Transcription recordings.
//
// This exercise is unusable without them. Its instruction opens "you will be
// presented with an audio clip of a short sentence and an unconnected speech
// version of the IPA transcription" — the learner's job is to transcribe the
// connected speech they hear, so with no clip there is nothing to transcribe.
//
// The clips are numbered (9C.1 … 9C.6) rather than named, so the mapping is
// worth stating. Two things support clip N belonging to question N:
//
//   1. The Drive doc numbers its questions 1-6 and the seed's questions are in
//      that same order, so the numbering is the doc's own, not an assumption.
//   2. Clip size tracks sentence length: ranking the six sentences by length
//      and reading off the clip sizes gives 16588, 19979, 27854, 20397, 34896,
//      35444 — ascending but for one pair. That pair is question 3, which the
//      doc says is spoken contracted ("do you wanna go for coffee?"), so it
//      runs shorter than its written form suggests. A shuffled mapping would
//      not hold that correlation.
//
// Strong, but not a substitute for hearing them; a listening pass is still
// worth doing before release.
//
// Idempotent. Run: node --env-file=.env scripts/add-9c-audio.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 27
const DIR = '9. Transcription in Action/9C.Audio'

const INSTRUCTIONS =
  'In this exercise, you will be presented with an audio clip of a short ' +
  'sentence and an unconnected speech version of the IPA transcription. In ' +
  'the provided answer space, type out the connected speech version to match ' +
  'the audio. Click “reveal answer” to see how close yours is. This is less ' +
  'an exact science, and more an exercise to reveal the distinction between ' +
  'connected and unconnected speech.'

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const questions = data.Question.filter((q) => q.quizId === QUIZ_ID)

// The mapping is positional, so a changed question count means the assumption
// above no longer holds and this must be re-checked rather than re-run.
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
  const key = `${DIR}/9C.${i + 1}.mp3`
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (!h.ContentLength) failures.push(`zero-byte: ${key}`)
    else {
      q.audioUrl = toUrl(key)
      attached++
      console.log(`  9C.${i + 1} -> ${q.text}`)
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
  console.log('written — run `yarn seed` to apply')
}
