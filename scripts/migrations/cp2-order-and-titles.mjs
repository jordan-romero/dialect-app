// Checkpoint 2 (lesson 26) in the order and names of Scott's 2026-10-18 Drive
// re-lettering:
//
//   A - Contextualizing "Hamlet's Advice"  (handout, now first)
//   B - Hamlet's Advice pt. 1              (quiz 36)
//   C - Hamlet's Advice pt. 2              (quiz 37)
//   D - Hamlet's Advice pt. 3              (quiz 38)
//   E - Hamlet's Advice pt. 4              (handout)
//   F - Full GenAm Transcription           (answer key)
//   G - Plain text
//
// The lesson flow was description → three quizzes → four handouts. The first
// resource step takes the first resource and the last takes the rest (see
// expandLessonSteps), so a resource step before the quizzes puts the
// Contextualizing handout ahead of them. Names follow the CE2 doc's
// "Instructional Materials" list. A and E were re-exported with their new
// letters and copied to S3 (scripts/drive-to-s3.mjs); F and G are unchanged.
//
// Always rewrites prisma/seed-data.json. Touches the database only with --db.
// Idempotent. Run: node --env-file=.env scripts/migrations/cp2-order-and-titles.mjs [--db]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', '..', 'prisma', 'seed-data.json')
const DB = process.argv.includes('--db')

const LESSON_ID = 26
const S3 = 'https://acting-accents.s3.amazonaws.com/Checkpoint+Exercise+2/'

const steps = [
  { type: 'description' },
  { type: 'resource' },
  { type: 'quiz' },
  { type: 'quiz' },
  { type: 'quiz' },
  { type: 'resource' },
  { type: 'outro' },
]

const resources = [
  {
    id: 44,
    order: 1,
    name: 'Contextualizing "Hamlet\'s Advice"',
    url: S3 + 'A+-+Contextualizing+Hamlet_s+Advice.pdf',
  },
  {
    id: 43,
    order: 2,
    name: "Hamlet's Advice pt. 4",
    url: S3 + 'E+-+Hamlet_s+Advice+pt.+4.pdf',
  },
  { id: 45, order: 3, name: "Hamlet's Advice Answer Key" },
  { id: 46, order: 4, name: "Hamlet's Advice Plain Text" },
]

// The handout is now the step right after this, not one of the closing ones.
const description =
  'Welcome to the 2nd checkpoint, which must be completed prior to advancing to phase 3. ' +
  'In these exercises, you will be tasked with transcribing an edited version of a monologue ' +
  'from Shakespeare’s Hamlet, famously called “Hamlet’s Advice to the Players”. Up next, the ' +
  '“Contextualizing Hamlet’s Advice” handout provides more context about the play, this ' +
  'piece, and some definitions of archaic terms.\n\n' +
  'For the first half of the monologue, each line will be presented as a different ' +
  'transcription exercise. For the second half, you will transcribe it on your own from ' +
  'scratch – you’ll be provided with an answer key to check your work.'

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const lesson = data.Lesson.find((l) => l.id === LESSON_ID)
lesson.steps = steps
lesson.description = description
for (const r of resources) {
  const row = data.Resource.find((x) => x.id === r.id && x.lessonId === LESSON_ID)
  if (!row) {
    console.error(`resource ${r.id} isn't on lesson ${LESSON_ID} — aborting`)
    process.exit(1)
  }
  Object.assign(row, r)
}
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log('seed-data.json written')

if (!DB) {
  console.log('database untouched (pass --db to apply)')
  process.exit(0)
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()
try {
  await prisma.$transaction(
    async (tx) => {
      await tx.lesson.update({ where: { id: LESSON_ID }, data: { steps, description } })
      for (const { id, ...rest } of resources) {
        await tx.resource.update({ where: { id }, data: rest })
      }
    },
    { timeout: 60_000 },
  )
  console.log('database updated')
} finally {
  await prisma.$disconnect()
}
