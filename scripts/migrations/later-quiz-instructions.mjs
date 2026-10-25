// Instructions from the Drive docs for every exercise from 10C on, plus 10C's
// prompts and recordings.
//
// Quizzes with no instructions fall back to wording the component infers from
// the quiz shape ("Choose the correct transcription for the presented word in
// a General American Dialect."), which is wrong for these one-off exercises.
// Wording is the doc's, except where the doc describes an interaction the app
// doesn't have (drag and drop): there it says what the learner actually does.
//
// Already correct, so untouched: 13b.B (39), CP1 Reading Comprehension (30),
// CP2 Hamlet pt. 3 (38). CP1 Matching, Build-a-Word and Corrections carry the
// doc's wording in their components.
//
// 10C (35): the prompt was "Choose the correctly-stressed transcription of
// “Playing”:", repeating the instructions on every card, so it is now just the
// word. The doc carries no audio, but 10C.1-10C.10 are on S3 and the doc's
// questions are in the same order as the seed's, so clip N is question N.
// Hamlet pt. 2 (37) had the same repeated prompt and gets the same treatment.
//
// Always rewrites prisma/seed-data.json and data/repeatAfterMeData.json.
// Touches the database only with --db. Idempotent.
// Run: node --env-file=.env scripts/migrations/later-quiz-instructions.mjs [--db]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const SEED = join(ROOT, 'prisma', 'seed-data.json')
const REPEAT_AFTER_ME = join(ROOT, 'data', 'repeatAfterMeData.json')
const DB = process.argv.includes('--db')

const INSTRUCTIONS = {
  // 10C - Stress Suprasegmentals
  35:
    'From the options below, choose the transcribed version of the word that ' +
    'correctly utilizes stress and syllabic indicators, as spoken in a General ' +
    'American Dialect. Click “Play Audio” to hear the word.',
  // 14a.C - Practice RP Changes
  28:
    'For each question, you will be presented with a phrase in GenAm IPA. ' +
    'Using the previously provided Lexical Chart for British Received ' +
    'Pronunciation, change the transcription into RP. Click “reveal answer” ' +
    'to check your work before moving on.',
  // CP2 A - Hamlet's Advice pt. 1. The doc builds the phrase from a word bank;
  // the app asks one word at a time, so this says that.
  36:
    'Build the presented line by choosing the correctly transcribed version ' +
    'of each word in it.',
  // CP2 B - Hamlet's Advice pt. 2
  37:
    'For each word in the line, you will be presented with three choices for ' +
    'the transcription – choose the correct one.',
}

// 13a.C - Repeat After Me TT's (file-based, quiz 15)
const REPEAT_AFTER_ME_INSTRUCTIONS =
  'Listen to the presented audio clip while following along with the provided ' +
  'transcription. Repeat the sentence afterwards with the indicated sound ' +
  'changes to practice the difference. As you complete each question, fill ' +
  'out the previously provided blank Lexical Chart with the presented RP changes.'

// “Choose the correctly-stressed transcription of “Playing”:” -> “Playing”
const WORD_ONLY = /^Choose the (?:correctly-stressed|correct) transcription of (“.+”):$/

const AUDIO_DIR = '10. Stress/10C.Audio'
const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key.split('/').map(encodeURIComponent).join('/')}`

const data = JSON.parse(readFileSync(SEED, 'utf-8'))

const questionUpdates = [] // { id, text?, audioUrl? }
for (const quizId of [35, 37]) {
  for (const q of data.Question.filter((q) => q.quizId === quizId)) {
    const m = q.text.match(WORD_ONLY)
    if (m) questionUpdates.push({ id: q.id, text: m[1] })
  }
}

const tenC = data.Question.filter((q) => q.quizId === 35).sort((a, b) => a.id - b.id)
if (tenC.length !== 10) {
  console.error(`expected 10 questions on 10C, found ${tenC.length} — aborting`)
  process.exit(1)
}
for (const [i, q] of tenC.entries()) {
  const key = `${AUDIO_DIR}/10C.${i + 1}.mp3`
  await s3.send(new HeadObjectCommand({ Bucket, Key: key })) // throws if missing
  const audioUrl = toUrl(key)
  if (q.audioUrl === audioUrl) continue
  const existing = questionUpdates.find((u) => u.id === q.id)
  if (existing) existing.audioUrl = audioUrl
  else questionUpdates.push({ id: q.id, audioUrl })
}

for (const [id, text] of Object.entries(INSTRUCTIONS)) {
  data.Quiz.find((z) => z.id === Number(id)).instructions = text
}
for (const u of questionUpdates) {
  const q = data.Question.find((q) => q.id === u.id)
  if (u.text) q.text = u.text
  if (u.audioUrl) q.audioUrl = u.audioUrl
  console.log(`  question ${u.id}: ${q.text}${u.audioUrl ? ' + audio' : ''}`)
}
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')

// Replace just the one line: re-serialising would reflow the hand-formatted file.
const ram = readFileSync(REPEAT_AFTER_ME, 'utf-8')
const ramLine = /^(\s*"instructions": ).*?(,?)$/m
if (!ramLine.test(ram)) {
  console.error('no "instructions" line in repeatAfterMeData.json — aborting')
  process.exit(1)
}
writeFileSync(
  REPEAT_AFTER_ME,
  ram.replace(ramLine, (_, k, comma) => `${k}${JSON.stringify(REPEAT_AFTER_ME_INSTRUCTIONS)}${comma}`),
)

console.log(
  `\n${Object.keys(INSTRUCTIONS).length} quiz instructions, ` +
    `${questionUpdates.length} questions, 13a.C file — written`,
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
      for (const [id, instructions] of Object.entries(INSTRUCTIONS)) {
        await tx.quiz.update({ where: { id: Number(id) }, data: { instructions } })
      }
      for (const u of questionUpdates) {
        const { id, ...rest } = u
        await tx.question.update({ where: { id }, data: rest })
      }
    },
    { timeout: 60_000 },
  )
  console.log('database updated')
} finally {
  await prisma.$disconnect()
}
