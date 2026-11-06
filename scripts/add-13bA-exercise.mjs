// Build the 13b.A exercise — "Repeat After Me Tongue Twisters".
//
// Same shape as 13a.C on Lesson 18: the learner hears a line, follows the
// transcription, records themselves and compares. Content lives in
// data/repeatAfterMe13bAData.json, transcribed from the Drive doc
// "13b.A - Repeat After Me TTs"; this adds the Quiz and marker Question rows
// the lesson flow and progress tracking need. Both lessons use quizType
// "repeatAfterMe", so pages/api/repeatAfterMe.ts picks the content file by
// lessonId.
//
// The six clips haven't been recorded yet (see docs/audio-still-needed.md).
// The exercise is built anyway: each item's audioUrl already names the file it
// expects in 13b.A.Audio/, so the clips start playing as soon as they're
// uploaded — no rebuild. This only reports which are still missing.
//
// Writes the new rows straight to the database (create only — it never
// rewrites existing content the way `yarn seed` does) and records them in
// prisma/seed-data.json.
//
// Idempotent. Run: node --env-file=.env scripts/add-13bA-exercise.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DATA = join(__dirname, '..', 'data', 'repeatAfterMe13bAData.json')
const DRY = process.argv.includes('--dry-run')

const LESSON_ID = 19

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const s3KeyFromUrl = (url) =>
  decodeURIComponent(
    new URL(url).pathname.replace(/^\//, '').replace(/\+/g, '%20'),
  )

const content = JSON.parse(readFileSync(DATA, 'utf-8'))
const QUIZ_ID = content.id

const quiz = {
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
}
const question = {
  id: content.questions[0].id,
  text: content.questions[0].text,
  questionType: 'repeatAfterMe',
  quizId: QUIZ_ID,
  categories: [],
  audioUrl: null,
}

// 13b.A comes before 13b.B in the module spec, so its quiz step goes ahead of
// the existing ones.
const withQuizStepFirst = (steps) => {
  const out = [...(steps ?? [])]
  const firstQuiz = out.findIndex((s) => s.type === 'quiz')
  out.splice(firstQuiz === -1 ? out.length - 1 : firstQuiz, 0, {
    type: 'quiz',
  })
  return out
}

const prisma = new PrismaClient()

if (await prisma.quiz.findUnique({ where: { id: QUIZ_ID } })) {
  console.log(`quiz ${QUIZ_ID} already exists — nothing to do`)
  await prisma.$disconnect()
  process.exit(0)
}
if (await prisma.question.findUnique({ where: { id: question.id } })) {
  console.error(`question id ${question.id} is already taken — aborting`)
  process.exit(1)
}

const missing = []
for (const item of content.items) {
  const Key = s3KeyFromUrl(item.audioUrl)
  try {
    await s3.send(new HeadObjectCommand({ Bucket, Key }))
  } catch {
    missing.push(Key)
  }
}
if (missing.length) {
  console.log(
    `${missing.length} of ${content.items.length} clips not uploaded yet — ` +
      'they will play once these exist:',
  )
  missing.forEach((m) => console.log(`  ${m}`))
}

const lesson = await prisma.lesson.findUnique({ where: { id: LESSON_ID } })
const steps = withQuizStepFirst(lesson.steps)
const existing = await prisma.quiz.findMany({
  where: { lessonId: LESSON_ID },
  orderBy: { order: 'asc' },
})
if (steps.filter((s) => s.type === 'quiz').length !== existing.length + 1) {
  console.error('quiz steps and quizzes would not line up — aborting')
  process.exit(1)
}
console.log(
  `lesson ${LESSON_ID} steps: ${steps.map((s) => s.type).join(' → ')}`,
)
console.log(
  `quiz order: 0:${quiz.title}  ` +
    existing.map((q) => `${q.order + 1}:${q.title}`).join('  '),
)

if (DRY) {
  console.log('\n--dry-run: nothing written')
  await prisma.$disconnect()
  process.exit(0)
}

// Existing quizzes shift down one. Progress is keyed by quiz id, so
// renumbering doesn't disturb saved answers.
await prisma.$transaction([
  ...existing.map((q) =>
    prisma.quiz.update({ where: { id: q.id }, data: { order: q.order + 1 } }),
  ),
  prisma.quiz.create({ data: quiz }),
  prisma.question.create({ data: question }),
  prisma.lesson.update({ where: { id: LESSON_ID }, data: { steps } }),
])
for (const t of ['Quiz', 'Question']) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${t}"', 'id'),
       (SELECT COALESCE(MAX(id), 1) FROM "${t}"), true)`,
  )
}
await prisma.$disconnect()
console.log('written to the database')

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
for (const q of data.Quiz) if (q.lessonId === LESSON_ID) q.order += 1
data.Quiz.push(quiz)
data.Question.push(question)
const seedLesson = data.Lesson.find((l) => l.id === LESSON_ID)
seedLesson.steps = withQuizStepFirst(seedLesson.steps)
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log('recorded in prisma/seed-data.json')
