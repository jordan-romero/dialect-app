// Build the missing 14a.B exercise — "Choose the Right Transcription".
//
// Module 14a's spec lists this as the second exercise and Lesson 23 shipped
// without it. Structurally it is 13b.B: the learner hears a clip and picks the
// transcription that represents it, and choosing wrong reveals that option's
// own audio so they can hear why it's wrong.
//
// Content is transcribed from the Drive doc "14a.B - Multiple Choice - Choose
// the Right Transcription". Per that doc the FIRST option is correct (the
// component shuffles), so the order below is the doc's order, not the display
// order.
//
// THIS WILL NOT WRITE UNTIL THE AUDIO EXISTS. None of the 20 clips have been
// recorded — see docs/audio-still-needed.md. Every option needs one, including
// the wrong ones, read exactly as transcribed. Until then this script reports
// what's missing and exits without touching anything. Once Scott's recordings
// are uploaded to 14a.B.Audio/, running it once completes the exercise.
//
// Idempotent. Run: node --env-file=.env scripts/add-14aB-exercise.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 41
const LESSON_ID = 23
const FIRST_QUESTION_ID = 426
const FIRST_OPTION_ID = 1281
const DIR = '14a. Dialect Transcription in Action/14a.B.Audio'

const INSTRUCTIONS =
  'Choose the transcription that best represents the presented audio clip. ' +
  'Once you’ve selected correctly, record your attempt at a reproduction of ' +
  'the presented text and listen back for accuracy.'

// From the Drive doc. First option in each list is the correct one.
const QUESTIONS = [
  {
    text: '“…near the duke street tower.”',
    options: [
      'nɪə̆ ðə dɪ̆uk stɹit̚ taʊ̆ə̆',
      'nɪɚ̆ ðə dɪ̆uk stɹit̚ taʊ̆ɚ̆',
      'nɪə̆ɹ ðə dɪ̆uk stɹit̚ taʊ̆ə̆ɹ',
      'nɪə̆ ðə dyuk stɹit taʊ̆ə̆',
    ],
  },
  {
    text: '“…on her first morning she felt stressed.”',
    options: [
      'ɒn hə fɜst mɔnɪŋ ʃi fɛlt stɹɛst',
      'ɒn hɚ fɝst mɔɚ̆nɪŋ ʃi fɛlt̚ stɹɛst',
      'ɑn hɜ fəst mɔnɪŋ ʃi fɛlt̚ stɹɛst',
      'ɒn həɹ fɜɹst mɔɹnɪŋ ʃi fɛlt̚ stɹɛst',
    ],
  },
  {
    text: '“…and washed her face in a hurry.”',
    options: [
      'ænd wɒʃt hə feɪ̆s ɪn ə hʌɹɪ',
      'ænd wɑʃt hə feɪ̆s ɪn ə hʌɹɪ',
      'ænd wɒʃt hə feɪ̆s ɪn ə hɝɪ',
      'ænd wɒʃt hɚ feɪ̆s ɪn ə hʌɹi',
    ],
  },
  {
    text: '“…because normally you would only expect to see it in a dog or a goat.”',
    options: [
      'bəkɑz nɔməlĭ ju wʊd əʊ̆nlĭ ɛkspɛkt̚ tə si ɪt ɪn ə dɒg ɔɹə gəʊ̆t',
      'bikɑz nɔməlĭ ju wʊd əʊ̆nlĭ ɛkspɛkt tə si ɪt̚ ɪn ə dɒg ɔɹə goʊ̆t̚',
      'bəkʌz nɔməlĭ ju wud əʊ̆nlĭ ɛkspɛkt̚ tə si ɪt ɪn ə dɒg əɹə goʊ̆t',
      'bəkɑz nɔɚ̆məlĭ ju wʊd oʊ̆nlĭ ɛkspɛkt̚ tə si ɪt ɪn ə dɑg ɔɹə gəʊ̆t',
    ],
  },
  {
    text: '“The goose’s owner, Mary Harrison, kept calling, ‘Comma, Comma’,”',
    options: [
      'ðə gusɪz əʊ̆nə mɛɹĭ hæɹɪsn̩ kɛpt kɔlɪŋ kɒmə kɒmə',
      'ðə gusɪz oʊ̆nə mɛɹĭ hæɹɪsn̩ kɛpt kɑlɪŋ kɒmə kɒmə',
      'ðə gusɪz əʊ̆nɚ mɛɚ̆ĭ hɛɚ̆ɪsn̩ kɛpt kɔlɪŋ kɒmə kɒmə',
      'ðə gusɪz əʊ̆nə mɛə̆ɹĭ hɛə̆ɹɪsn̩ kɛpt kɔlɪŋ kɑmə kɑmə',
    ],
  },
]

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const LETTERS = ['a', 'b', 'c', 'd']

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

const data = JSON.parse(readFileSync(SEED, 'utf-8'))

if (data.Quiz.some((q) => q.id === QUIZ_ID)) {
  console.log(`quiz ${QUIZ_ID} already exists — nothing to do`)
  process.exit(0)
}

// Every clip must exist before anything is written. The exercise is unusable
// without them: the clip is the question, and a wrong pick has to play back
// the option the learner chose.
const missing = []
for (const [i] of QUESTIONS.entries()) {
  for (const letter of LETTERS) {
    const key = `${DIR}/14aB.${i + 1}.${letter}.mp3`
    try {
      const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
      if (!h.ContentLength) missing.push(`${key} (zero bytes)`)
    } catch {
      missing.push(key)
    }
  }
}

if (missing.length) {
  console.error(
    `Not building 14a.B yet — ${missing.length} of 20 recordings are missing:\n`,
  )
  missing.forEach((m) => console.error(`  ${m}`))
  console.error(
    '\nThe exercise content below is ready; it needs only the audio.' +
      '\nSee docs/audio-still-needed.md for the text to record.',
  )
  process.exit(1)
}

// --- everything below runs only once all 20 clips are on S3 ---

let questionId = FIRST_QUESTION_ID
let optionId = FIRST_OPTION_ID

for (const [i, q] of QUESTIONS.entries()) {
  const qid = questionId++
  data.Question.push({
    id: qid,
    text: q.text,
    questionType: 'multipleChoice',
    quizId: QUIZ_ID,
    categories: [],
    // The question plays the correct reading.
    audioUrl: toUrl(`${DIR}/14aB.${i + 1}.a.mp3`),
  })
  q.options.forEach((optionText, j) => {
    data.AnswerOption.push({
      id: optionId++,
      optionText,
      isCorrect: j === 0,
      questionId: qid,
      feedback: null,
      rhymeCategory: null,
      rhymingWordId: null,
      // Each option carries its own reading, so a wrong pick can be heard.
      audioUrl: toUrl(`${DIR}/14aB.${i + 1}.${LETTERS[j]}.mp3`),
    })
  })
}

// 14a.B follows the existing "Practice RP Changes" exercise on this lesson.
const existing = data.Quiz.filter((q) => q.lessonId === LESSON_ID)
data.Quiz.push({
  id: QUIZ_ID,
  title: 'Choose the Right Transcription',
  lessonId: LESSON_ID,
  score: null,
  passScore: 70,
  hasBeenAttempted: false,
  quizType: 'multipleChoice',
  order: existing.length,
  isCompleted: false,
  instructions: INSTRUCTIONS,
})

const lesson = data.Lesson.find((l) => l.id === LESSON_ID)
const steps = lesson.steps ?? []
const lastQuiz = steps.map((s) => s.type).lastIndexOf('quiz')
steps.splice(lastQuiz === -1 ? steps.length - 1 : lastQuiz + 1, 0, {
  type: 'quiz',
})
lesson.steps = steps

// A step sequence that doesn't match the quiz count renders the wrong
// exercise; catch it here rather than in the browser.
const quizSteps = steps.filter((s) => s.type === 'quiz').length
const quizCount = data.Quiz.filter((q) => q.lessonId === LESSON_ID).length
if (quizSteps !== quizCount) {
  console.error(
    `MISMATCH: ${quizSteps} quiz steps but ${quizCount} quizzes — aborting`,
  )
  process.exit(1)
}

console.log(
  `14a.B: ${QUESTIONS.length} questions · ${QUESTIONS.length * 4} options · all 20 clips verified on S3`,
)
console.log(`steps → ${steps.map((s) => s.type).join(' → ')}`)

if (DRY) console.log('\n--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('\nwritten — run `yarn seed` to apply')
}
