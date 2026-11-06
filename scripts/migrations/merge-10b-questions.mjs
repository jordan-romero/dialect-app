// 10B Syllabic Stress: Noun vs. Verb — one question per sentence.
//
// The Drive doc gives each word ONE sentence with two blanks and two
// transcriptions "presented in correct order". It had been imported as two
// multiple-choice questions per word ("fills the FIRST blank?" / "the SECOND
// blank?"), so every sentence was asked twice. This folds each pair into the
// first question of the pair, which becomes a stressPlacement question: the
// sentence with both blanks, and its two options in blank order (option ids
// ascending = first blank, second blank).
//
// The second question of each pair is deleted, along with its options and any
// learner answers to it (no FK cascades, so children go first).
//
// Always rewrites prisma/seed-data.json. Touches the database only with --db.
// Idempotent: a quiz already converted is left alone.
// Run: node --env-file=.env scripts/migrations/merge-10b-questions.mjs [--db]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', '..', 'prisma', 'seed-data.json')
const DB = process.argv.includes('--db')

const QUIZ_ID = 34
const QUIZ_TYPE = 'stressPlacement'
// The doc's wording said "drag"; the exercise is tap-to-place.
const INSTRUCTIONS =
  'For each example sentence, tap the transcribed words to place them in the ' +
  'correct spots based on the contextual meaning of the different stresses.'

const PROMPT = /^“(.*?)””? — Which transcription of “(.+?)” fills the (FIRST|SECOND) blank\?$/

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const quiz = data.Quiz.find((q) => q.id === QUIZ_ID)
if (quiz.quizType === QUIZ_TYPE) {
  console.log(`quiz ${QUIZ_ID} already converted — nothing to do`)
  process.exit(0)
}

const questions = data.Question.filter((q) => q.quizId === QUIZ_ID).sort(
  (a, b) => a.id - b.id,
)
if (questions.length !== 20) {
  console.error(`expected 20 questions on quiz ${QUIZ_ID}, found ${questions.length} — aborting`)
  process.exit(1)
}

const keep = []
const drop = []
for (let i = 0; i < questions.length; i += 2) {
  const [first, second] = [questions[i], questions[i + 1]]
  const a = first.text.match(PROMPT)
  const b = second.text.match(PROMPT)
  if (!a || !b || a[3] !== 'FIRST' || b[3] !== 'SECOND' || a[1] !== b[1]) {
    console.error(`questions ${first.id}/${second.id} are not a FIRST/SECOND pair — aborting`)
    process.exit(1)
  }
  const options = data.AnswerOption.filter((o) => o.questionId === first.id).sort(
    (x, y) => x.id - y.id,
  )
  // The pair's first question lists the first-blank answer first; check that
  // its options really are in blank order before relying on id order.
  const secondCorrect = data.AnswerOption.find(
    (o) => o.questionId === second.id && o.isCorrect,
  )
  if (
    options.length !== 2 ||
    !options[0].isCorrect ||
    options[1].optionText !== secondCorrect?.optionText
  ) {
    console.error(`options on question ${first.id} are not in blank order — aborting`)
    process.exit(1)
  }
  const sentence = a[1].replace(/\s+\./g, '.')
  keep.push({
    id: first.id,
    text: `${a[2]} — “${sentence}”`,
    optionIds: options.map((o) => o.id),
  })
  drop.push(second.id)
}

keep.forEach((k) => console.log(`  ${k.id}: ${k.text}`))
console.log(`\nkeeping ${keep.length}, deleting ${drop.length}: ${drop.join(', ')}`)

// seed-data.json
quiz.quizType = QUIZ_TYPE
quiz.instructions = INSTRUCTIONS
for (const k of keep) {
  const q = data.Question.find((q) => q.id === k.id)
  q.text = k.text
  q.questionType = QUIZ_TYPE
  data.AnswerOption.filter((o) => k.optionIds.includes(o.id)).forEach(
    (o) => (o.isCorrect = true),
  )
}
const dropSet = new Set(drop)
data.Question = data.Question.filter((q) => !dropSet.has(q.id))
data.AnswerOption = data.AnswerOption.filter((o) => !dropSet.has(o.questionId))
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log('seed-data.json written')

if (!DB) {
  console.log('database untouched (pass --db to apply)')
  process.exit(0)
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()
try {
  await prisma.$transaction(async (tx) => {
    const answers = await tx.userAnswer.deleteMany({ where: { questionId: { in: drop } } })
    await tx.answerOption.deleteMany({ where: { questionId: { in: drop } } })
    await tx.question.deleteMany({ where: { id: { in: drop } } })
    for (const k of keep) {
      await tx.question.update({
        where: { id: k.id },
        data: { text: k.text, questionType: QUIZ_TYPE },
      })
      await tx.answerOption.updateMany({
        where: { id: { in: k.optionIds } },
        data: { isCorrect: true },
      })
    }
    await tx.quiz.update({
      where: { id: QUIZ_ID },
      data: { quizType: QUIZ_TYPE, instructions: INSTRUCTIONS },
    })
    console.log(`database updated (${answers.count} learner answers to deleted questions removed)`)
    // ~25 round trips to a remote database outlast Prisma's 5s default.
  }, { timeout: 60_000 })
} finally {
  await prisma.$disconnect()
}
