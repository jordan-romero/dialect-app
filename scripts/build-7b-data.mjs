// Generate the 7B "Building the Diphthongs & Triphthongs" exercise data.
//
// Module 7's spec lists three exercises; this is the one that was never built.
// The learner hears a diphthong or triphthong and builds it by clicking its
// component vowels, in order, from the IPA vowel quadrilateral.
//
// Content is from the Drive doc "7B - Building the Diphthongs and Triphthongs".
// Its two chart images are the standard IPA quadrilateral, differing only in the
// central pair (ə/ɜ vs ɚ/ɝ) — so questions carry a `rhotic` flag and the chart
// swaps those two symbols.
//
// The data file lives in data/ (not public/) and is served by
// pages/api/buildDiphthongs.ts, which runs it through signDeep. A file in
// public/ is served straight from disk, so its S3 URLs would never be signed
// and every clip would 403.
//
// Run: node --env-file=.env scripts/build-7b-data.mjs [--dry-run]

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'data', 'buildDiphthongsData.json')
const DRY = process.argv.includes('--dry-run')

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

const DIR_7B = '7. Diphthongs & Triphthongs/7B.Audio'
const DIR_7D = '7. Diphthongs & Triphthongs/7D.Audio'
const DIR_6B = '6. Vowels/6B.Audio'

const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

// The 18 sounds the learner builds. `parts` is the ordered click sequence.
// aɪ̆ə̆ was thought unrecorded until a sweep of the unreferenced audio found it
// in Krista's folders. It is NOT rhotic — it ends in ə, which only appears on
// the plain chart — so it is filed here as non-rhotic despite the design doc
// grouping it with the rhotic set. Worth Krista confirming.
const QUESTIONS = [
  // Option 1 — plain diphthongs, non-rhotic chart
  { symbol: 'aɪ̆', parts: ['a', 'ɪ'], rhotic: false },
  { symbol: 'eɪ̆', parts: ['e', 'ɪ'], rhotic: false },
  { symbol: 'oʊ̆', parts: ['o', 'ʊ'], rhotic: false },
  { symbol: 'aʊ̆', parts: ['a', 'ʊ'], rhotic: false },
  { symbol: 'ɪ̆u', parts: ['ɪ', 'u'], rhotic: false },
  { symbol: 'ɔɪ̆', parts: ['ɔ', 'ɪ'], rhotic: false },
  {
    symbol: 'aɪ̆ə̆',
    parts: ['a', 'ɪ', 'ə'],
    rhotic: false,
    audioKey: `${DIR_7B}/aɪ̆ə̆.mp3`,
  },
  // Option 2 — rhotic diphthongs and triphthongs, rhotic chart
  { symbol: 'ɑɚ̆', parts: ['ɑ', 'ɚ'], rhotic: true },
  { symbol: 'ɔɚ̆', parts: ['ɔ', 'ɚ'], rhotic: true },
  {
    symbol: 'ɛɚ̆',
    parts: ['ɛ', 'ɚ'],
    rhotic: true,
    audioKey: `${DIR_7D}/ɛɚ̆.wav`,
  },
  { symbol: 'ɪɚ̆', parts: ['ɪ', 'ɚ'], rhotic: true },
  { symbol: 'ʊɚ̆', parts: ['ʊ', 'ɚ'], rhotic: true },
  { symbol: 'aɪ̆ɚ̆', parts: ['a', 'ɪ', 'ɚ'], rhotic: true },
  { symbol: 'aʊ̆ɚ̆', parts: ['a', 'ʊ', 'ɚ'], rhotic: true },
  { symbol: 'ɔɪ̆ɚ̆', parts: ['ɔ', 'ɪ', 'ɚ'], rhotic: true },
  { symbol: 'ɪ̆ʊɚ̆', parts: ['ɪ', 'ʊ', 'ɚ'], rhotic: true },
  { symbol: 'ɛɪ̆ɚ̆', parts: ['ɛ', 'ɪ', 'ɚ'], rhotic: true },
  { symbol: 'oʊ̆ɚ̆', parts: ['o', 'ʊ', 'ɚ'], rhotic: true },
]

// Per-symbol clips for the chart itself. e, o, ɔ, a and ɜ were never recorded
// — they aren't GenAm monophthongs — so those buttons simply won't offer audio.
const CHART_AUDIO = {
  i: `${DIR_7B}/i.mp3`,
  u: `${DIR_7B}/u.mp3`,
  æ: `${DIR_7B}/æ.mp3`,
  ɑ: `${DIR_7B}/ɑ.mp3`,
  ə: `${DIR_7B}/ə.mp3`,
  ɚ: `${DIR_7B}/ɚ.mp3`,
  ɛ: `${DIR_7B}/ɛ.mp3`,
  ɝ: `${DIR_7B}/ɝ.mp3`,
  ʊ: `${DIR_7B}/ʊ.mp3`,
  ʌ: `${DIR_7B}/ʌ.mp3`,
  // KIT is filed under breve-i, and S3 stores that key DECOMPOSED (i + U+0306).
  // It must be byte-exact here: the precomposed ĭ (U+012D) does not match.
  ɪ: `${DIR_6B}/i\u0306.wav`,
}

const exists = async (key) => {
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
    return !!h.ContentLength
  } catch {
    return false
  }
}

const failures = []
const questions = []
for (const q of QUESTIONS) {
  const key = q.audioKey ?? `${DIR_7B}/${q.symbol}.mp3`
  if (!(await exists(key)))
    failures.push(`question ${q.symbol}: missing ${key}`)
  questions.push({
    symbol: q.symbol,
    parts: q.parts,
    rhotic: q.rhotic,
    audioUrl: toUrl(key),
  })
}

const chartAudio = {}
for (const [symbol, key] of Object.entries(CHART_AUDIO)) {
  if (await exists(key)) chartAudio[symbol] = toUrl(key)
  else failures.push(`chart symbol ${symbol}: missing ${key}`)
}

if (failures.length) {
  console.error('REFUSING TO WRITE — missing audio:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}

const data = {
  id: 40,
  lessonId: 10,
  quizType: 'buildDiphthongs',
  title: 'Building the Diphthongs & Triphthongs',
  instructions:
    'A diphthong or triphthong will play. Build it by clicking its vowels, in order, on the quadrilateral. Double-click any vowel to hear it on its own.',
  // One marker question, matching the other file-based exercises: progress and
  // submission are keyed to it, while `items` holds the actual content.
  questions: [{ id: 425, text: 'Building the Diphthongs & Triphthongs' }],
  items: questions,
  chartAudio,
}

console.log(
  `${questions.length} questions · ${
    Object.keys(chartAudio).length
  } chart clips · all verified on S3`,
)
if (DRY) console.log('--dry-run: nothing written')
else {
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n')
  console.log(`written to data/buildDiphthongsData.json`)
}
