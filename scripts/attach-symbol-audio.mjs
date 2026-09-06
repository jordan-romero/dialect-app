// Attach the per-symbol IPA recordings to the symbol questions of 7C.
//
// The recordings have always been on S3, organised by module/exercise letter,
// but nothing referenced them because the database spells several symbols
// differently from the audio filenames. This resolves the two spellings against
// each other, verifies every object really exists, and writes the URLs into
// prisma/seed-data.json. Run `yarn seed` afterwards to push them to the DB.
//
// THE RULE FOR ADDING A TARGET: attach audio only where the exercise's own
// on-screen instruction tells the learner to play it. 7C part 2 says «Click the
// "Play Audio" button to hear the symbol», so its symbol questions get audio.
// The three symbolPicker "in Word Context" exercises (quizzes 8, 9 and 11) say
// only «Select the IPA symbol that corresponds with the underlined part of the
// word» — no audio is offered there, and adding it would hand over the answer,
// since the recording IS the sound the learner is being asked to identify.
// Do not add those quizzes here without changing their instructions first.
//
// Canonical spelling and the variant table are documented in
// docs/ipa-symbol-notation.md — read that before editing VARIANTS.
//
// Idempotent: never overwrites a question that already has audio.
// Run: node --env-file=.env scripts/attach-symbol-audio.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

// Canonical symbol -> spellings actually used in S3 filenames.
// See docs/ipa-symbol-notation.md for why each of these differs.
const VARIANTS = {
  ɪ: ['ĭ'], // KIT vowel is filed under breve-i in every symbol audio folder
  aʊ̆ɚ̆: ['aʊɚ̆'], // filename drops the breve on ʊ
  ɛɪ̆ɚ̆: ['eɪ̆.ɚ̆', 'eɪ̆ɚ̆'], // filename uses e, plus a dot separator
  oʊ̆ɚ̆: ['oʊ̆.ɚ̆'], // filename uses a dot separator
  aɪ̆ɚ̆: ['aɪ̆.ɚ̆'],
}

// Which audio folder backs which quiz. The module letter is the join key —
// note module 7 runs one letter ahead of 5 and 6 (no PDF at position B).
const TARGETS = [
  {
    // Part 2 of 7C: the learner is shown a symbol and picks the word that
    // contains it, so hearing the symbol is the point of the exercise. Only
    // the symbol-only questions — the word questions (Enjoy, Share, …) are
    // part 1 and already have their own audio. mp3 matches those siblings.
    quizId: 10,
    label: '7C Match the Symbol (symbol-only questions)',
    folder: 'Diphthongs & Triphtongs/audio',
    preferExt: ['mp3', 'wav'],
    onlyMissingAudio: true,
  },
]

const nfc = (s) => s.normalize('NFC')
// Question text wraps bare symbols in brackets in some quizzes: "[ɑɚ̆]".
const symbolOf = (text) => nfc(text.replace(/^\[|\]$/g, '').trim())

// '/'-preserving percent encoding, matching how every other URL in the DB is
// stored and what lib/s3.ts s3KeyFromUrl() expects to parse back out.
const toUrl = (key) =>
  `https://${Bucket}.s3.amazonaws.com/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

// Mirror of lib/s3.ts s3KeyFromUrl — used to prove the URL we write will sign.
function parseBack(url) {
  const u = new URL(url)
  if (!u.host.startsWith(`${Bucket}.s3`)) return null
  return decodeURIComponent(u.pathname.replace(/^\//, '').replace(/\+/g, '%20'))
}

async function listBucket() {
  const keys = []
  let token
  do {
    const r = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        ContinuationToken: token,
        MaxKeys: 1000,
      }),
    )
    for (const o of r.Contents || []) keys.push(o.Key)
    token = r.IsTruncated ? r.NextContinuationToken : undefined
  } while (token)
  return keys
}

// folder -> symbol -> ext -> key
function indexByFolder(keys) {
  const idx = {}
  for (const key of keys) {
    const cut = key.lastIndexOf('/')
    if (cut < 0) continue
    const folder = key.slice(0, cut)
    const base = key.slice(cut + 1)
    const m = base.match(/^(.*)\.(wav|mp3)$/i)
    if (!m) continue
    const [, stem, ext] = m
    ;((idx[folder] ||= {})[nfc(stem)] ||= {})[ext.toLowerCase()] = key
  }
  return idx
}

function resolve(idx, folder, symbol, preferExt) {
  const folderIdx = idx[folder] || {}
  for (const spelling of [symbol, ...(VARIANTS[symbol] || []).map(nfc)]) {
    const hit = folderIdx[spelling]
    if (!hit) continue
    for (const ext of [...preferExt, ...Object.keys(hit)]) {
      if (hit[ext]) return hit[ext]
    }
  }
  return null
}

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const idx = indexByFolder(await listBucket())
const byId = new Map(data.Question.map((q) => [q.id, q]))

const plan = []
const unresolved = []
for (const t of TARGETS) {
  let questions = data.Question.filter((q) => q.quizId === t.quizId)
  if (t.onlyMissingAudio) questions = questions.filter((q) => !q.audioUrl)
  let found = 0
  for (const q of questions) {
    const symbol = symbolOf(q.text)
    const key = resolve(idx, t.folder, symbol, t.preferExt)
    if (key) {
      plan.push({ questionId: q.id, symbol, key })
      found++
    } else {
      unresolved.push({ quiz: t.label, symbol })
    }
  }
  console.log(`${t.label}: resolved ${found}/${questions.length}`)
}

// Prove every URL points at a real object AND survives the round-trip through
// the parser signDeep() uses. A URL that doesn't parse back would be served to
// the browser unsigned and 403 for the learner.
let verified = 0
const failures = []
for (const p of plan) {
  const url = toUrl(p.key)
  if (parseBack(url) !== p.key) {
    failures.push(`round-trip failed: ${p.key}`)
    continue
  }
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket, Key: p.key }))
    if (!head.ContentLength) failures.push(`zero-byte object: ${p.key}`)
    else verified++
  } catch (e) {
    failures.push(`${e.name}: ${p.key}`)
  }
}
console.log(`\nverified ${verified}/${plan.length} objects on S3`)
if (failures.length) {
  console.error('\nFAILURES — nothing written:')
  failures.forEach((f) => console.error(`  ${f}`))
  process.exit(1)
}

if (unresolved.length) {
  console.log('\nNo recording found for (see docs/ipa-symbol-notation.md):')
  unresolved.forEach((u) => console.log(`  ${u.symbol}  — ${u.quiz}`))
}

let written = 0
for (const p of plan) {
  const q = byId.get(p.questionId)
  if (q.audioUrl) continue // never clobber existing audio
  q.audioUrl = toUrl(p.key)
  written++
}

if (DRY) {
  console.log(`\n--dry-run: would set audioUrl on ${written} questions`)
} else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log(`\nset audioUrl on ${written} questions in prisma/seed-data.json`)
  console.log('run `yarn seed` to push to the database')
}
