// Repoint the course at Scott's renumbered modules (Nov 2026).
//
// Drive renamed the old split modules to straight numbers:
//   13a → 13  Segmental Features      13c → 15  Prosody
//   13b → 14  Distinct Features       14a → 16  Dialect Transcription in Action
//   14b → 17  Transcription Transformation
//   15  → 18  Performance Implementation      16 (Outro) → 19
//
// The renamed PDFs, audio and videos were uploaded to S3 under the new
// folders alongside the old ones (nothing old was deleted), so this only has
// to swap the links held in the database: lesson videos, resource PDFs and the
// 14B question/answer audio.
//
// Every target is HEAD-checked on S3 first. A row whose new file isn't there
// yet (e.g. a video still uploading) is left on its old link and reported, so
// the script is safe to run early and run again — rows already moved are
// skipped.
//
// Dry run by default:
//   node --env-file=.env scripts/migrations/renumber-modules-13-19.mjs
//   node --env-file=.env scripts/migrations/renumber-modules-13-19.mjs --apply
import { PrismaClient } from '@prisma/client'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const APPLY = process.argv.includes('--apply')
const Bucket = process.env.AWS_S3_BUCKET_NAME || 'acting-accents'
const HOST = `https://${Bucket}.s3.amazonaws.com/`
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const prisma = new PrismaClient()

const M13 = '13. Segmental Features of the Dialect/'
const M14 = '14. Distinct Features of the Dialect/'
const M15 = '15. Prosody of the Dialect/'
const M16 = '16. Dialect Transcription in Action/'
const M17 = '17. Transcription Transformation/'
const M18 = '18. Performance Implementation/'

// Old S3 key (decoded) → new S3 key (decoded).
const KEYS = {
  // videos (Grayson's [TITLE UPDATE] cuts, uploaded without the tag)
  '13a. Segmental Features of the Dialect/13a Segmental Features of the Dialect.mp4': `${M13}13 Segmental Features of the Dialect.mp4`,
  '13b. Distinct Features of the Dialect/13b Distinct Features of the Dialect.mp4': `${M14}14 Distinct Features of the Dialect.mp4`,
  '13c. Prosody of the Dialect/13c Prosody of the Dialect.mp4': `${M15}15 Prosody of the Dialect.mp4`,
  '14a. Dialect Transcription in Action/14a Dialect Transcription in Action.mp4': `${M16}16 Dialect Transcription in Action.mp4`,
  '14b. Transcription Transformation/14b Transcription Transformation.mp4': `${M17}17 Transcription Transformation.mp4`,
  '15. Performance Implementation/15 Performance Implementation.mp4': `${M18}18 Performance Implementation.mp4`,
  '16. Outro/Outro Option 1.mp4': '19. Outro/Outro Option 1.mp4',

  // handouts
  '13a. Segmental Features of the Dialect/13a.A - Blank RP Lexical Template.pdf': `${M13}13A - Blank RP Lexical Template.pdf`,
  '13a. Segmental Features of the Dialect/13a.B - Ask List.pdf': `${M13}13B - Ask List.pdf`,
  '13a. Segmental Features of the Dialect/13a.D - Distinct RP Features of Comma.pdf': `${M13}13D - Segmental RP Features of Comma.pdf`,
  '13b. Distinct Features of the Dialect/13b.C.2 - Comma RP Answer Key.pdf': `${M14}14C.2 - Comma RP Answer Key.pdf`,
  '13c. Prosody of the Dialect/13c.A - British RP Resource Links.pdf': `${M15}15A - British RP Resource Links.pdf`,
  '13c. Prosody of the Dialect/13c.B - Prosody Worksheet.pdf': `${M15}15B - Prosody Worksheet.pdf`,
  '13c. Prosody of the Dialect/13c.B.2 - Prosody Worksheet Example.pdf': `${M15}15B.2 - Prosody Worksheet Example.pdf`,
  '13c. Prosody of the Dialect/13c.C - Marking the Prosody.pdf': `${M15}15C - Marking the Prosody.pdf`,
  '13c. Prosody of the Dialect/13c.D - Paul Meier - Comma Gets a Cure.mp3': `${M15}15D - Paul Meier - Comma Gets a Cure.mp3`,
  '14a. Dialect Transcription in Action/14a.A - British RP Lexical Chart.pdf': `${M16}16A - British RP Lexical Chart.pdf`,
  "14b. Transcription Transformation/14b.B - Hamlet's Advice RP Answer Key.pdf": `${M17}17B - Hamlet's Advice RP Answer Key.pdf`,
  '15. Performance Implementation/15A - Self-Tape.pdf': `${M18}18A - Self-Tape.pdf`,
  '15. Performance Implementation/15B - Deciding Your Next Dialect.pdf': `${M18}18B - Deciding Your Next Dialect.pdf`,
  '15. Performance Implementation/15C - Steps to Learn a New Dialect or Accent.pdf': `${M18}18C - Steps to Learn a New Dialect or Accent.pdf`,
  '15. Performance Implementation/15D - Dialects and Accents Resource List.pdf': `${M18}18D - Dialects and Accents Resource List.pdf`,
}

// 14B "Choose the Right Transcription" clips: 13bB.<q>.<x> → 14B.<q>.<x>
// (one old file was misnamed 13bB.1.c.p3.mp3; the copy dropped the stray p3).
const audioKey = (old) => {
  const m = old.match(
    /^13b\. Distinct Features of the Dialect\/13b\.B\.Audio\/13bB\.(\d+)\.([a-d])\.(?:p3\.)?mp3$/,
  )
  return m ? `${M14}14B.Audio/14B.${m[1]}.${m[2]}.mp3` : null
}

// Handout names that changed along with the file.
const RENAMED = {
  'Distinct RP Features of Comma': 'Segmental RP Features of Comma',
}

const keyOf = (url) =>
  url?.startsWith(HOST)
    ? decodeURIComponent(url.slice(HOST.length).replace(/\+/g, ' '))
    : null
const urlOf = (key) =>
  HOST +
  key
    .split('/')
    .map((p) => encodeURIComponent(p).replace(/'/g, '%27'))
    .join('/')
const newKeyFor = (url) => {
  const k = keyOf(url)
  return k ? KEYS[k] ?? audioKey(k) : null
}

const exists = new Map()
const onS3 = async (Key) => {
  if (!exists.has(Key)) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket, Key }))
      exists.set(Key, true)
    } catch (err) {
      if (err?.$metadata?.httpStatusCode !== 404) throw err
      exists.set(Key, false)
    }
  }
  return exists.get(Key)
}

const plan = []
const missing = []
const queue = async (table, id, field, url, extra = {}) => {
  const key = newKeyFor(url)
  if (!key) return
  if (!(await onS3(key))) return missing.push(`${table} ${id}: ${key}`)
  plan.push({ table, id, data: { [field]: urlOf(key), ...extra }, key })
}

for (const l of await prisma.lesson.findMany())
  await queue('lesson', l.id, 'videoUrl', l.videoUrl)
for (const r of await prisma.resource.findMany())
  await queue(
    'resource',
    r.id,
    'url',
    r.url,
    RENAMED[r.name] ? { name: RENAMED[r.name] } : {},
  )
for (const q of await prisma.question.findMany({
  where: { audioUrl: { not: null } },
}))
  await queue('question', q.id, 'audioUrl', q.audioUrl)
for (const o of await prisma.answerOption.findMany({
  where: { audioUrl: { not: null } },
}))
  await queue('answerOption', o.id, 'audioUrl', o.audioUrl)

for (const p of plan) console.log(`${p.table} ${p.id} → ${p.key}`)
if (missing.length) {
  console.log(`\nLeft on the old link (new file not on S3 yet):`)
  missing.forEach((m) => console.log(`  ${m}`))
}

if (!APPLY) {
  console.log(
    `\nDry run: ${plan.length} to update. Re-run with --apply to write.`,
  )
} else {
  await prisma.$transaction(
    plan.map((p) =>
      prisma[p.table].update({ where: { id: p.id }, data: p.data }),
    ),
  )
  console.log(`\nUpdated ${plan.length} rows.`)
}
await prisma.$disconnect()
