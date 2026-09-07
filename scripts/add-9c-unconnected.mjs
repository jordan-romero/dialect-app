// Show 9C's unconnected transcription alongside the sentence.
//
// The exercise's instruction promises the learner "an unconnected speech
// version of the IPA transcription" and asks them to "type out the connected
// speech version to match the audio". Only the English sentence was being
// shown, which makes it a different and much harder task: transcribing from
// scratch rather than converting one transcription into another.
//
// The format follows quiz 28, which already presents a sentence and its
// transcription this way ("…” — GenAm /…/"), so no rendering change is needed.
//
// Keyed on the existing sentence rather than on position, and skips any
// question already carrying a transcription, so re-running is safe.
//
// Idempotent. Run: node scripts/add-9c-unconnected.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')
const QUIZ_ID = 27

// From the Drive doc "9C - Descriptive Transcription", the line printed under
// each sentence — the unconnected reading, not the answer.
const UNCONNECTED = {
  '“Give me a break.”': '/gɪv mi eɪ̆ bɹeɪ̆k/',
  '“The wheels on the automobile”': '/ði wiɫz ɑn ði ɑtoʊ̆moʊ̆biɫ/',
  '“Do you want to go for coffee?”': '/du ju wɑnt tu goʊ̆ fɔɚ̆ kɑfĭ/',
  '“You two are too close to the campfire.”':
    '/ju tu ɑɚ̆ tu kloʊ̆s tu ði kæmpfaɪ̆ɚ̆/',
  '“In his suit and tie”': '/ɪn hɪz sut ænd taɪ̆/',
  '“He got cranky on the trip to the plaza.”':
    '/hi gɑt kɹæŋkĭ ɑn ðə tɹɪp tu ðə plɑzə/',
}

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const questions = data.Question.filter((q) => q.quizId === QUIZ_ID)

const failures = []
let updated = 0
let already = 0

for (const q of questions) {
  if (q.text.includes(' — unconnected ')) {
    already++
    continue
  }
  const ipa = UNCONNECTED[q.text]
  if (!ipa) {
    failures.push(`no unconnected transcription on file for: ${q.text}`)
    continue
  }
  q.text = `${q.text} — unconnected ${ipa}`
  updated++
  console.log(`  ${q.text}`)
}

// Every question must be accounted for; a sentence that stopped matching means
// the content changed and the doc needs re-reading, not a partial write.
if (failures.length) {
  console.error('\nREFUSING TO WRITE:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}

console.log(`\n${updated} updated · ${already} already had one`)
if (DRY) console.log('--dry-run: nothing written')
else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('written')
}
