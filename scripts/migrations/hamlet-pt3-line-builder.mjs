// CP2 D — Hamlet's Advice pt. 3 as the line it is, built phrase by phrase.
//
// The doc's six audio phrases, in order, are lines 6-7 of the monologue. They
// had been multiple-choice cards worded "In “…You must acquire…”, choose the
// correct transcription of “acquire”:", so the line never read as a line. Now
// they use the pt. 2 line builder: each question is its phrase with the
// transcribed part in brackets (bold in the line, replaced by its IPA once
// chosen), categories[0] names the sentence, and each keeps its audio clip.
// Same questions, options and audio (ids 395-400), so no answers are lost.
//
// Always rewrites prisma/seed-data.json. Touches the database only with --db.
// Idempotent. Run: node --env-file=.env scripts/migrations/hamlet-pt3-line-builder.mjs [--db]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', '..', 'prisma', 'seed-data.json')
const DB = process.argv.includes('--db')

const QUIZ_ID = 38
const QUIZ_TYPE = 'lineBuilder'

// The doc's "Audio:" phrases with its transcribed words bracketed, in order.
const PHRASES = [
  { id: 395, text: 'You must [acquire]', sentence: '1' },
  { id: 396, text: 'and [beget a] temperance', sentence: '1' },
  { id: 397, text: 'that may give it [smoothness.]', sentence: '1' },
  { id: 398, text: 'Be not too tame [neither,]', sentence: '2' },
  { id: 399, text: 'but [let your] own discretion', sentence: '2' },
  { id: 400, text: 'be your [tutor.]', sentence: '2' },
]

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const quiz = data.Quiz.find((q) => q.id === QUIZ_ID)
const ids = data.Question.filter((q) => q.quizId === QUIZ_ID)
  .map((q) => q.id)
  .sort((a, b) => a - b)
if (ids.join() !== PHRASES.map((p) => p.id).join()) {
  console.error(`quiz ${QUIZ_ID} questions are ${ids.join()}, not the six expected — aborting`)
  process.exit(1)
}

quiz.quizType = QUIZ_TYPE
for (const p of PHRASES) {
  const q = data.Question.find((q) => q.id === p.id)
  // The bracketed words must be the ones the question already asked about.
  const focus = p.text.match(/\[(.+?)\]/)[1].replace(/[.,]$/, '')
  if (!q.text.includes(`“${focus}”`) && q.text !== p.text) {
    console.error(`question ${p.id} doesn't ask about “${focus}” — aborting`)
    process.exit(1)
  }
  q.text = p.text
  q.categories = [p.sentence]
  q.questionType = QUIZ_TYPE
}
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log('seed-data.json written')
PHRASES.forEach((p) => console.log(`  ${p.id} [${p.sentence}] ${p.text}`))

if (!DB) {
  console.log('database untouched (pass --db to apply)')
  process.exit(0)
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()
try {
  await prisma.$transaction(
    async (tx) => {
      for (const p of PHRASES) {
        await tx.question.update({
          where: { id: p.id },
          data: { text: p.text, categories: [p.sentence], questionType: QUIZ_TYPE },
        })
      }
      await tx.quiz.update({ where: { id: QUIZ_ID }, data: { quizType: QUIZ_TYPE } })
    },
    { timeout: 60_000 },
  )
  console.log('database updated')
} finally {
  await prisma.$disconnect()
}
