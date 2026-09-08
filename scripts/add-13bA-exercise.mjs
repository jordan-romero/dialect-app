// Build the missing 13b.A exercise — "Repeat After Me Tongue Twisters".
//
// Module 13b's spec lists three exercises; Lesson 19 shipped with none, 13b.B
// was added earlier, and this is the last of them. It is the same shape as
// 13a.C on Lesson 18: the learner hears a line, follows the transcription,
// records themselves and compares. Content lives in
// data/repeatAfterMe13bAData.json, transcribed from the Drive doc
// "13b.A - Repeat After Me TTs"; this adds the Quiz and marker Question rows
// the lesson flow and progress tracking need.
//
// Both lessons use quizType "repeatAfterMe", so pages/api/repeatAfterMe.ts
// picks the content file by lessonId.
//
// THIS WILL NOT WRITE UNTIL THE AUDIO EXISTS. None of the six clips have been
// recorded — see docs/audio-still-needed.md, which carries the RP
// transcriptions to read. Without them there is nothing to repeat after, so
// registering the exercise would only put a broken step in the lesson. Once
// the recordings are uploaded to 13b.A.Audio/, running this once completes it.
//
// Idempotent. Run: node --env-file=.env scripts/add-13bA-exercise.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DATA = join(__dirname, '..', 'data', 'repeatAfterMe13bAData.json')
const DRY = process.argv.includes('--dry-run')

const LESSON_ID = 19

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const s3KeyFromUrl = (url) =>
  decodeURIComponent(new URL(url).pathname.replace(/^\//, '').replace(/\+/g, '%20'))

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const content = JSON.parse(readFileSync(DATA, 'utf-8'))
const QUIZ_ID = content.id
const QUESTION_ID = content.questions[0].id

if (data.Quiz.some((q) => q.id === QUIZ_ID)) {
  console.log(`quiz ${QUIZ_ID} already exists — nothing to do`)
  process.exit(0)
}
if (data.Question.some((q) => q.id === QUESTION_ID)) {
  console.error(`question id ${QUESTION_ID} is already taken — aborting`)
  process.exit(1)
}

const missing = []
for (const item of content.items) {
  const key = s3KeyFromUrl(item.audioUrl)
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (!h.ContentLength) missing.push(`${key} (zero bytes)`)
  } catch {
    missing.push(key)
  }
}

if (missing.length) {
  console.error(
    `Not building 13b.A yet — ${missing.length} of ${content.items.length} recordings are missing:\n`,
  )
  missing.forEach((m) => console.error(`  ${m}`))
  console.error(
    '\nThe exercise content is ready in data/repeatAfterMe13bAData.json;' +
      '\nit needs only the audio. Read in RP, following the transcriptions there.',
  )
  process.exit(1)
}

// --- everything below runs only once all six clips are on S3 ---

data.Question.push({
  id: QUESTION_ID,
  text: content.questions[0].text,
  questionType: 'repeatAfterMe',
  quizId: QUIZ_ID,
  categories: [],
  audioUrl: null,
})

// 13b.A comes before 13b.B in the module spec, so it takes the first slot and
// the existing quizzes on this lesson shift down. Progress is keyed by quiz
// id, so renumbering doesn't disturb saved answers.
for (const q of data.Quiz) {
  if (q.lessonId === LESSON_ID) q.order += 1
}
data.Quiz.push({
  id: QUIZ_ID,
  title: 'Repeat After Me Tongue Twisters',
  lessonId: LESSON_ID,
  score: null,
  passScore: 70,
  hasBeenAttempted: false,
  quizType: 'repeatAfterMe',
  order: 0,
  isCompleted: false,
  instructions: null,
})

const lesson = data.Lesson.find((l) => l.id === LESSON_ID)
const steps = lesson.steps ?? []
const firstQuiz = steps.findIndex((s) => s.type === 'quiz')
steps.splice(firstQuiz === -1 ? steps.length - 1 : firstQuiz, 0, { type: 'quiz' })
lesson.steps = steps

const quizSteps = steps.filter((s) => s.type === 'quiz').length
const quizCount = data.Quiz.filter((q) => q.lessonId === LESSON_ID).length
if (quizSteps !== quizCount) {
  console.error(`MISMATCH: ${quizSteps} quiz steps but ${quizCount} quizzes — aborting`)
  process.exit(1)
}

const orders = data.Quiz.filter((q) => q.lessonId === LESSON_ID)
  .sort((a, b) => a.order - b.order)
  .map((q) => `${q.order}:${q.title}`)
console.log(`13b.A: ${content.items.length} lines · all clips verified on S3`)
console.log(`lesson ${LESSON_ID} order → ${orders.join('  |  ')}`)
console.log(`steps → ${steps.map((s) => s.type).join(' → ')}`)

if (DRY) console.log('\n--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('\nwritten — run `yarn seed` to apply')
}
