// CP2 A — Hamlet's Advice pt. 1, rebuilt to match its Drive doc.
//
// The doc ("A - Hamlet's Advice pt. 1") builds each phrase of the opening
// lines from a shuffled word bank: the right transcriptions in order, plus a
// few wrong ones to throw the learner off, one slot per word. It had been
// imported as 21 one-word multiple-choice questions covering part of the
// text. Now it's one stressPlacement question per phrase (the 10B
// tap-to-place exercise in its phrase-building shape): the right words are
// the isCorrect options in id order, the decoys follow.
//
// Keeps question ids 343-348 for the six phrases and deletes 349-363. Every
// option on the quiz is replaced, and learner answers on it are deleted (they
// were one-word picks, meaningless to the new questions). No FK cascades, so
// children go first.
//
// Always rewrites prisma/seed-data.json. Touches the database only with --db.
// Idempotent: a quiz already converted is left alone.
// Run: node --env-file=.env scripts/migrations/rebuild-hamlet-pt1.mjs [--db]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', '..', 'prisma', 'seed-data.json')
const DB = process.argv.includes('--db')

const QUIZ_ID = 36
const QUIZ_TYPE = 'stressPlacement'
// The doc says "dragging and dropping"; the exercise is tap-to-place.
const INSTRUCTIONS =
  'Build the presented phrase by tapping the correctly transcribed words from ' +
  'the word bank in the right order.'

// Straight from the doc: Rights in order, then Wrongs.
const PHRASES = [
  {
    line: 'Speak the speech, I pray you,',
    rights: 'spik ðə spit͡ʃ aɪ̆ pɹeɪ̆ ju',
    wrongs: 'speɪ̆k spiʃ pɾeɪ̆',
  },
  {
    line: 'as I pronounced it to you,',
    rights: 'æz aɪ̆ pɹənaʊ̆nst ɪt tʊ ju',
    wrongs: 'ai pɹənaʊ̆nzd',
  },
  {
    line: 'trippingly on the tongue.',
    rights: 'ˈtɹɪpɪŋlĭ ɑn ðə tʌŋ',
    wrongs: 'tɹɪpɪŋglĭ təŋ',
  },
  {
    line: 'But if you mouth it,',
    rights: 'bəɾ ɪf ju maʊ̆ð ɪt̚',
    wrongs: 'jə maɪ̆θ',
  },
  {
    line: 'as many of your players do,',
    rights: 'æz mɛnĭ əv jɔɚ̆ ple.ɚz du',
    wrongs: 'mɪnĭ jɝ',
  },
  {
    line: 'I had as lief the town-crier spoke my lines.',
    rights: 'aɪ̆ hæd æz lif ðə taʊ̆n kɹaɪ̆ɚ̆ spoʊ̆k maɪ̆ laɪ̆nz',
    wrongs: 'hɑd kraɪ̆ɚ̆ ɫaɪ̆ns',
  },
]
const words = (s) => s.trim().split(/\s+/)

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const quiz = data.Quiz.find((q) => q.id === QUIZ_ID)
if (quiz.quizType === QUIZ_TYPE) {
  console.log(`quiz ${QUIZ_ID} already converted — nothing to do`)
  process.exit(0)
}

const questionIds = data.Question.filter((q) => q.quizId === QUIZ_ID)
  .map((q) => q.id)
  .sort((a, b) => a - b)
if (questionIds.length !== 21 || questionIds[0] !== 343) {
  console.error(`quiz ${QUIZ_ID} isn't the 21 questions from 343 this expects — aborting`)
  process.exit(1)
}
const keep = questionIds.slice(0, PHRASES.length)
const drop = questionIds.slice(PHRASES.length)

let nextOptionId = Math.max(...data.AnswerOption.map((o) => o.id)) + 1
const options = []
PHRASES.forEach((p, i) => {
  for (const [list, isCorrect] of [
    [words(p.rights), true],
    [words(p.wrongs), false],
  ]) {
    for (const optionText of list) {
      options.push({
        id: nextOptionId++,
        optionText,
        isCorrect,
        rhymeCategory: null,
        rhymingWordId: null,
        audioUrl: null,
        feedback: null,
        questionId: keep[i],
      })
    }
  }
})

// seed-data.json
quiz.quizType = QUIZ_TYPE
quiz.instructions = INSTRUCTIONS
keep.forEach((id, i) => {
  const q = data.Question.find((q) => q.id === id)
  q.text = PHRASES[i].line
  q.questionType = QUIZ_TYPE
  console.log(`  ${id}: ${q.text}  [${words(PHRASES[i].rights).length} slots]`)
})
const all = new Set(questionIds)
data.Question = data.Question.filter((q) => !drop.includes(q.id))
data.AnswerOption = data.AnswerOption.filter((o) => !all.has(o.questionId)).concat(options)
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log(
  `\nseed-data.json written: ${keep.length} phrases, ${options.length} options, ` +
    `deleted questions ${drop[0]}-${drop[drop.length - 1]}`,
)

if (!DB) {
  console.log('database untouched (pass --db to apply)')
  process.exit(0)
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()
try {
  await prisma.$transaction(
    async (tx) => {
      const answers = await tx.userAnswer.deleteMany({ where: { quizId: QUIZ_ID } })
      await tx.answerOption.deleteMany({ where: { questionId: { in: questionIds } } })
      await tx.question.deleteMany({ where: { id: { in: drop } } })
      for (const [i, id] of keep.entries()) {
        await tx.question.update({
          where: { id },
          data: { text: PHRASES[i].line, questionType: QUIZ_TYPE },
        })
      }
      await tx.answerOption.createMany({ data: options })
      await tx.quiz.update({
        where: { id: QUIZ_ID },
        data: { quizType: QUIZ_TYPE, instructions: INSTRUCTIONS },
      })
      // Explicit ids don't advance the sequence; move it past them.
      await tx.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"AnswerOption"', 'id'),
           (SELECT MAX(id) FROM "AnswerOption"), true)`,
      )
      console.log(`database updated (${answers.count} learner answers removed)`)
    },
    { timeout: 60_000 },
  )
} finally {
  await prisma.$disconnect()
}
