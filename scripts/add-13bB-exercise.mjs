// Build the missing 13b.B exercise — "Choose the Right Transcription".
//
// Module 13b's spec lists three exercises and Lesson 19 shipped with none. This
// adds the second of them, whose 24 recordings have been sitting on S3 under
// "13b.B.Audio" since 2024 with nothing referencing them.
//
// Content is transcribed from the Drive doc "13b.B - Choose the Right
// Transcription". Per that doc: the learner hears a clip and picks the
// transcription that represents it; the FIRST option is the correct one (the
// component shuffles); each question plays the correct answer's audio; and a
// wrong pick reveals that option's own audio so the learner can hear why.
//
// Idempotent — re-running makes no changes once the quiz exists.
// Run: node --env-file=.env scripts/add-13bB-exercise.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const AUDIO_DIR = '13b. Distinct Features of the Dialect/13b.B.Audio'

const QUIZ_ID = 39
const LESSON_ID = 19

const INSTRUCTIONS =
  'Choose the transcription that best represents the presented audio clip.'

// Option order here is the authored order: [0] is always the correct answer.
// `audio` is the file suffix — 1.c is misnamed on S3 and is handled below.
const QUESTIONS = [
  {
    text: 'Arthur is our only son.',
    options: [
      'ɑθə ɹɪz ɑ ɹəʊ̆nlĭ sʌn',
      'ɑθə ɪz ɑ əʊ̆nlĭ sʌn',
      'ɑθɚ ɪz ɑɚ̆ əʊ̆nlĭ sʌn',
      'ɑθə rɪz ɑ rəʊ̆nlĭ sʌn',
    ],
  },
  {
    text: 'Mama is an expert of tax law in America and France.',
    options: [
      'məmɑ ɹɪz ən ɛkspət əv tæks lɔ ɹɪn əmɛɹɪkə ɹænd fɹɑns',
      'məmɑ ɪz ən ɛkspət əv tæks lɔ ɪn əmɛɹɪkə ænd fɹɑns',
      'məmɑ rɪz ən ɛkspət əv tæks lɔ rɪn əmɛɹɪkə rænd fɹɑns',
      'məmɑɚ ɪz ən ɛkspət əv tæks lɔɚ ɪn əmɛɹɪkɚ ænd fɹɑns',
    ],
  },
  {
    text: 'On Tuesdays I take the tube to the duke’s new studio.',
    options: [
      'ɒn tɪ̆uzdeɪ̆z aɪ̆ teɪ̆k ðə tɪ̆ub tʊ ðə dɪ̆uks nɪ̆u ˈstɪ̆udĭˌəʊ̆',
      'ɒn tuzdeɪ̆z aɪ̆ teɪ̆k ðə tub tʊ ðə duks nu ˈstudĭˌəʊ̆',
      'ɒn tyuzdeɪ̆z aɪ̆ teɪ̆k ðə tyub tʊ ðə dyuks nyu ˈstyudĭˌəʊ̆',
      'ɒn tiʊzdeɪ̆z aɪ̆ teɪ̆k ðə tiʊb tʊ ðə diʊks niʊ ˈstiʊdĭˌəʊ̆',
    ],
  },
  {
    text: 'They found an ordinary dictionary in the observatory.',
    options: [
      'ðeɪ̆ faʊ̆nd ən ɔd̚n̩ɹĭ dɪkʃn̩ɹĭ ɪn ðə əbzɜvətɹĭ',
      'ðeɪ̆ faʊ̆nd ən ɔdn̩ɛɹĭ dɪkʃn̩ɛɹĭ ɪn ðə əbzɜvətɔɹĭ',
      'ðeɪ̆ faʊ̆nd ən ɔdn̩ɹy dɪkʃn̩ɹy ɪn ðə əbzɜvətɹy',
      'ðeɪ̆ faʊ̆nd ən ɔdn̩rĭ dɪkʃn̩rĭ ɪn ðə əbzɜvətrĭ',
    ],
  },
  {
    text: 'The hostile juvenile was agile with his mobile phone.',
    options: [
      'ðə hɒstaɪ̆l d͡ʒuvənaɪ̆l wəz æd͡ʒaɪ̆l wɪθ hɪz məʊ̆baɪ̆l fəʊ̆n',
      'ðə hɒstɫ̩ d͡ʒuvənɫ̩ wəz æd͡ʒɫ̩ wɪθ hɪz məʊ̆bɫ̩ fəʊ̆n',
      'ðə hɒstaɪ̆ʊ d͡ʒuvənaɪ̆ʊ wəz æd͡ʒaɪ̆ʊ wɪvɪz məʊ̆baɪ̆ʊ fəʊ̆n',
      'ðə hɒstil d͡ʒuvənil wəz æd͡ʒil wɪð hɪz məʊ̆bil fəʊ̆n',
    ],
  },
  {
    text: 'It was silly to worry about losing the gray bag.',
    options: [
      'ɪt wəz͜ sɪlɪ tʊ wʌɾɪ əbaʊ̆t luzɪŋ ðə gɹɛɪ̆ bɛg',
      'ɪt wəz͜ sɪlĭ tʊ wʌɹĭ əbaʊ̆t luzɪŋ ðə gɹeɪ̆ bæg',
      'ɪt wəz͜ sɪlɪ tʊ wʌdĭ əbaʊ̆t luzɪŋ ðə gɹɛɪ̆ bɜg',
      'ɪt wəz͜ sɪly tʊ wɝɪ əbaʊ̆t luzɪŋ ðə gɹaɪ̆ bɜg',
    ],
  },
]

// 13bB.1.c was uploaded with a mangled name; every other clip follows the
// pattern. Mapping it here beats renaming the object out from under any other
// reference to it.
const audioKey = (q, letter) =>
  q === 1 && letter === 'c'
    ? `${AUDIO_DIR}/13bB.1.c.p3.mp3`
    : `${AUDIO_DIR}/13bB.${q}.${letter}.mp3`

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

// Mirror of lib/s3.ts s3KeyFromUrl — proves the URL will presign.
function parseBack(url) {
  const u = new URL(url)
  if (!u.host.startsWith(`${Bucket}.s3`)) return null
  return decodeURIComponent(u.pathname.replace(/^\//, '').replace(/\+/g, '%20'))
}

const data = JSON.parse(readFileSync(SEED, 'utf-8'))

if (data.Quiz.some((q) => q.id === QUIZ_ID)) {
  console.log(`quiz ${QUIZ_ID} already exists — nothing to do`)
  process.exit(0)
}

const LETTERS = ['a', 'b', 'c', 'd']
let questionId = Math.max(...data.Question.map((q) => q.id))
let optionId = Math.max(...data.AnswerOption.map((o) => o.id))

const newQuestions = []
const newOptions = []
for (const [i, q] of QUESTIONS.entries()) {
  const n = i + 1
  questionId++
  newQuestions.push({
    id: questionId,
    text: q.text,
    questionType: 'multipleChoice',
    quizId: QUIZ_ID,
    categories: [],
    // The question plays the CORRECT reading — that's the clip being matched.
    audioUrl: toUrl(audioKey(n, 'a')),
  })
  for (const [j, optionText] of q.options.entries()) {
    optionId++
    newOptions.push({
      id: optionId,
      optionText,
      isCorrect: j === 0,
      rhymeCategory: null,
      rhymingWordId: null,
      audioUrl: toUrl(audioKey(n, LETTERS[j])),
      feedback: null,
      questionId,
    })
  }
}

// Every clip must exist and every URL must survive the round-trip, or we write
// nothing — a bad URL here reaches the learner as a dead play button.
const failures = []
for (const url of [
  ...newQuestions.map((q) => q.audioUrl),
  ...newOptions.map((o) => o.audioUrl),
]) {
  const key = parseBack(url)
  if (!key) {
    failures.push(`round-trip failed: ${url}`)
    continue
  }
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (!head.ContentLength) failures.push(`zero-byte object: ${key}`)
  } catch (e) {
    failures.push(`${e.name}: ${key}`)
  }
}
if (failures.length) {
  console.error('REFUSING TO WRITE — audio problems:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}
console.log(`verified ${newQuestions.length + newOptions.length} clips on S3`)

data.Quiz.push({
  id: QUIZ_ID,
  title: 'Choose the Right Transcription',
  lessonId: LESSON_ID,
  score: null,
  passScore: 70,
  hasBeenAttempted: false,
  quizType: 'multipleChoice',
  order: 0,
  isCompleted: false,
  instructions: INSTRUCTIONS,
})
data.Question.push(...newQuestions)
data.AnswerOption.push(...newOptions)

// Slot the exercise into the lesson flow, before the answer-key PDF.
const lesson = data.Lesson.find((l) => l.id === LESSON_ID)
const steps = lesson.steps ?? []
if (!steps.some((s) => s.type === 'quiz')) {
  const at = steps.findIndex((s) => s.type === 'resource')
  const quizStep = { type: 'quiz' }
  if (at === -1) steps.splice(Math.max(steps.length - 1, 0), 0, quizStep)
  else steps.splice(at, 0, quizStep)
  lesson.steps = steps
}

console.log(
  `quiz ${QUIZ_ID} + ${newQuestions.length} questions + ${newOptions.length} options`,
)
console.log(
  `lesson ${LESSON_ID} steps: ${steps.map((s) => s.type).join(' → ')}`,
)

if (DRY) {
  console.log('\n--dry-run: nothing written')
} else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('\nwritten to prisma/seed-data.json — run `yarn seed` to apply')
}
