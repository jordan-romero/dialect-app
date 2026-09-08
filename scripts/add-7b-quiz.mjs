// Register the 7B exercise in the course structure.
//
// The exercise's content lives in data/buildDiphthongsData.json (see
// scripts/build-7b-data.mjs); this adds the Quiz and marker Question rows the
// lesson flow and progress tracking need, and slots it into Lesson 10.
//
// Module 7's spec orders the exercises 7B → 7C → 7D, so 7B goes first and the
// existing two shift down. `order` is what maps a quiz onto its step position;
// progress is keyed by quiz id, so renumbering doesn't disturb saved answers.
//
// Idempotent. Run: node scripts/add-7b-quiz.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DATA = join(__dirname, '..', 'data', 'buildDiphthongsData.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 40
const LESSON_ID = 10

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const content = JSON.parse(readFileSync(DATA, 'utf-8'))
const QUESTION_ID = content.questions[0].id

if (data.Quiz.some((q) => q.id === QUIZ_ID)) {
  console.log(`quiz ${QUIZ_ID} already exists — nothing to do`)
  process.exit(0)
}
if (data.Question.some((q) => q.id === QUESTION_ID)) {
  console.error(`question id ${QUESTION_ID} is already taken — aborting`)
  process.exit(1)
}

// 7B takes order 0; the existing quizzes on this lesson shift down one.
for (const q of data.Quiz) {
  if (q.lessonId === LESSON_ID) q.order += 1
}

data.Quiz.push({
  id: QUIZ_ID,
  title: content.title,
  lessonId: LESSON_ID,
  score: null,
  passScore: 70,
  hasBeenAttempted: false,
  quizType: 'buildDiphthongs',
  order: 0,
  isCompleted: false,
  instructions: null,
})
data.Question.push({
  id: QUESTION_ID,
  text: content.questions[0].text,
  questionType: 'buildDiphthongs',
  quizId: QUIZ_ID,
  categories: [],
  audioUrl: null,
})

// Add the extra quiz step, immediately after the 7A handout.
const lesson = data.Lesson.find((l) => l.id === LESSON_ID)
const steps = lesson.steps ?? []
const quizSteps = steps.filter((s) => s.type === 'quiz').length
if (quizSteps < 3) {
  const firstQuiz = steps.findIndex((s) => s.type === 'quiz')
  steps.splice(firstQuiz === -1 ? steps.length - 1 : firstQuiz, 0, {
    type: 'quiz',
  })
  lesson.steps = steps
}

const orders = data.Quiz.filter((q) => q.lessonId === LESSON_ID)
  .sort((a, b) => a.order - b.order)
  .map((q) => `${q.order}:${q.quizType}`)
console.log(`lesson ${LESSON_ID} quiz order → ${orders.join('  ')}`)
console.log(`steps → ${steps.map((s) => s.type).join(' → ')}`)

// The step sequence and the quiz orders have to line up, or a step renders the
// wrong exercise. Check it here rather than discovering it in the browser.
const quizStepCount = steps.filter((s) => s.type === 'quiz').length
const quizCount = data.Quiz.filter((q) => q.lessonId === LESSON_ID).length
if (quizStepCount !== quizCount) {
  console.error(
    `MISMATCH: ${quizStepCount} quiz steps but ${quizCount} quizzes — aborting`,
  )
  process.exit(1)
}

if (DRY) console.log('\n--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('\nwritten — run `yarn seed` to apply')
}
