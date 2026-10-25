// Correct the Rhyming Words exercise (quiz 1) against its source doc,
// "b. EXERCISE - Rhyming Words".
//
// Five defects, found by diffing the exercise against that doc:
//
//   1. Q2's on-screen text is inverted. It says "drag all the words that
//      rhyme with THOUGHT", but both the doc and the grading code want the
//      opposite — RhymingCategoriesQuestion marks a word in the "thought"
//      column correct when its rhymeCategory is NOT "thought". A learner
//      following the instruction as written got the question entirely wrong.
//      The doc's wording is restored; the code is already right.
//   2. Q2 is missing "Nought" (the doc lists both Nought and Naught).
//   3. Q3 is missing the three word-bank decoys that belong in neither
//      column, and the sentence warning about them. Q1 keeps its equivalent
//      trap (Cough and Through), so this looks like an omission.
//   4. Q4 is missing "Aired" and "Paired" — its BARED column had 3 of 5 —
//      and "Faired" is a typo for the doc's "fared".
//   5. Q4's "Gourd " carries a trailing space.
//
// Idempotent. Run: node scripts/fix-rhyming-words.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 1
let nextOptionId = 1275 // 14a.B reserves 1281+

const Q2_TEXT =
  'Select the three words that do not rhyme with the word “THOUGHT” in a ' +
  'General American dialect from the words below.'
const Q3_TEXT =
  'Drag the words in the word-bank below beneath their rhyming counterparts. ' +
  'Be careful, some words in the bank do not have a rhyming partner.'

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const questions = data.Question.filter((q) => q.quizId === QUIZ_ID)
if (questions.length !== 4) {
  console.error(`expected 4 questions on quiz ${QUIZ_ID}, found ${questions.length}`)
  process.exit(1)
}
const [, q2, q3, q4] = questions
const changes = []

const optionsFor = (qid) =>
  data.AnswerOption.filter((o) => o.questionId === qid)

const addOption = (question, optionText, rhymeCategory, isCorrect = false) => {
  if (optionsFor(question.id).some((o) => o.optionText.trim() === optionText)) return
  data.AnswerOption.push({
    id: nextOptionId++,
    optionText,
    isCorrect,
    questionId: question.id,
    feedback: null,
    rhymeCategory,
    rhymingWordId: null,
    audioUrl: null,
  })
  changes.push(`  + added "${optionText}" to Q${questions.indexOf(question) + 1}`)
}

// 1. the inverted instruction
if (q2.text !== Q2_TEXT) {
  q2.text = Q2_TEXT
  changes.push('  ~ Q2 instruction corrected — it told learners to do the opposite of what is graded')
}

// 2. the missing rhyming word
addOption(q2, 'Nought', 'thought')

// The three non-rhymers are the answer to Q2; only one was flagged. Grading
// reads rhymeCategory, not isCorrect, so this is consistency rather than a
// behaviour change — but inconsistent data invites a future bug.
for (const o of optionsFor(q2.id)) {
  if (o.rhymeCategory === null && !o.isCorrect) {
    o.isCorrect = true
    changes.push(`  ~ Q2 "${o.optionText}" flagged correct (it is one of the three non-rhymers)`)
  }
}

// 3. the missing decoys, and the warning that they exist
if (q3.text.trim() !== Q3_TEXT) {
  q3.text = Q3_TEXT
  changes.push('  ~ Q3 instruction restored the "no rhyming partner" warning')
}
for (const w of ['Nuclear', 'Liar', 'Drier']) addOption(q3, w, null)

// 4 & 5. Q4's BARED column and the stray whitespace
for (const o of optionsFor(q4.id)) {
  if (o.optionText !== o.optionText.trim()) {
    changes.push(`  ~ Q4 "${o.optionText}" → "${o.optionText.trim()}" (stray whitespace)`)
    o.optionText = o.optionText.trim()
  }
  if (o.optionText === 'Faired') {
    o.optionText = 'Fared'
    changes.push('  ~ Q4 "Faired" → "Fared" (doc spelling)')
  }
}
for (const w of ['Aired', 'Paired']) addOption(q4, w, 'Bared')

if (!changes.length) {
  console.log('already correct — nothing to do')
  process.exit(0)
}

console.log('Rhyming Words (quiz 1):')
changes.forEach((c) => console.log(c))

// Each category must end up with the count the doc gives it.
const EXPECTED = { Bird: 5, Bored: 5, Beard: 5, Bared: 5 }
const counts = {}
for (const o of optionsFor(q4.id)) {
  if (o.rhymeCategory) counts[o.rhymeCategory] = (counts[o.rhymeCategory] || 0) + 1
}
for (const [cat, n] of Object.entries(EXPECTED)) {
  if (counts[cat] !== n) {
    console.error(`\nABORTING: Q4 ${cat} has ${counts[cat] ?? 0} words, doc says ${n}`)
    process.exit(1)
  }
}
console.log(`\nQ4 columns verified: ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(' · ')}`)

if (DRY) console.log('--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('written — run `yarn seed` to apply')
}
