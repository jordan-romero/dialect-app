// CP2 C — Hamlet's Advice pt. 2 as one line that builds as you go.
//
// The doc: "As they select the correct word, the sentence should build to
// completion, i.e. each word populates in the final sentence as they find the
// correct answer." It had been 31 loose multiple-choice cards, which read as a
// vocabulary drill rather than a sentence. Same questions and options (the
// doc's order, ids 364-394); they become lineBuilder questions, each word
// carrying the doc's punctuation, with categories[0] naming its sentence so
// the component can lay them out as two lines.
//
// Saved answers keep their multiple-choice shape, so nothing is deleted.
//
// Always rewrites prisma/seed-data.json. Touches the database only with --db.
// Idempotent. Run: node --env-file=.env scripts/migrations/hamlet-pt2-line-builder.mjs [--db]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', '..', 'prisma', 'seed-data.json')
const DB = process.argv.includes('--db')

const QUIZ_ID = 37
const QUIZ_TYPE = 'lineBuilder'

// From the doc, in order; each sentence is one screen.
const SENTENCES = [
  'Nor do not saw the air too much with your hand thus, but use all gently.',
  'For in the very torrent, tempest, and, as I may say, whirlwind of your passion,',
]
const words = SENTENCES.flatMap((s, i) =>
  s.split(' ').map((text) => ({ text, sentence: String(i + 1) })),
)

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const quiz = data.Quiz.find((q) => q.id === QUIZ_ID)
const questions = data.Question.filter((q) => q.quizId === QUIZ_ID).sort(
  (a, b) => a.id - b.id,
)
if (questions.length !== words.length) {
  console.error(`expected ${words.length} questions, found ${questions.length} — aborting`)
  process.exit(1)
}

const updates = questions.map((q, i) => {
  // Each stored word must be the doc's word, punctuation aside.
  const bare = (s) => s.replace(/[“”.,]/g, '')
  if (bare(q.text) !== bare(words[i].text)) {
    console.error(`question ${q.id} is ${q.text}, expected ${words[i].text} — aborting`)
    process.exit(1)
  }
  return { id: q.id, text: words[i].text, categories: [words[i].sentence] }
})

quiz.quizType = QUIZ_TYPE
for (const u of updates) {
  const q = data.Question.find((q) => q.id === u.id)
  q.text = u.text
  q.categories = u.categories
  q.questionType = QUIZ_TYPE
}
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log(`seed-data.json written: ${updates.length} words in ${SENTENCES.length} lines`)

if (!DB) {
  console.log('database untouched (pass --db to apply)')
  process.exit(0)
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()
try {
  await prisma.$transaction(
    async (tx) => {
      for (const { id, ...rest } of updates) {
        await tx.question.update({
          where: { id },
          data: { ...rest, questionType: QUIZ_TYPE },
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
