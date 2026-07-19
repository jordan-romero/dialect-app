// Content seed for the Acting Accents course (courses, lessons, quizzes,
// questions, answer options, extra options, resources).
//
// SAFE / IDEMPOTENT: upserts every row by its primary key. It recreates all
// content on a fresh database and is also safe to re-run against a populated
// one — it never touches User / Enrollment / LessonProgress / UserAnswer data.
//
// Data lives in prisma/seed-data.json (a snapshot of the dev database).
// Run with:  yarn seed     (or: npx prisma db seed)
//
// To refresh the snapshot from the live DB, re-run the export step in
// prisma/export-seed-data.mjs (see that file).

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(
  readFileSync(join(__dirname, 'seed-data.json'), 'utf-8'),
)

const prisma = new PrismaClient()

// Upsert every row of a model by id, in order. `transform` lets us normalize
// columns (e.g. coerce a null scalar-list to []).
async function seedModel(name, delegate, rows, transform = (r) => r) {
  let n = 0
  for (const raw of rows) {
    const row = transform({ ...raw })
    const { id, ...rest } = row
    await delegate.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    })
    n++
  }
  console.log(`  ${name}: upserted ${n}`)
  return n
}

// Postgres autoincrement sequences must be bumped past the max explicit id we
// inserted, or the next app-created row collides on the primary key.
async function resetSequence(table) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'),
       (SELECT COALESCE(MAX(id), 1) FROM "${table}"), true)`,
  )
}

async function main() {
  console.log('Seeding content (upsert, FK-safe order)…')

  // Parents first so foreign keys always resolve.
  await seedModel('Course', prisma.course, data.Course)
  await seedModel('Lesson', prisma.lesson, data.Lesson, (r) => {
    // steps is a Prisma Json column; pass the object/array through (or null).
    if (r.steps === undefined) r.steps = null
    return r
  })
  await seedModel('Quiz', prisma.quiz, data.Quiz)
  await seedModel('Question', prisma.question, data.Question, (r) => {
    // categories is a non-nullable String[]; never pass null.
    if (r.categories == null) r.categories = []
    return r
  })
  await seedModel('AnswerOption', prisma.answerOption, data.AnswerOption)
  await seedModel('ExtraOption', prisma.extraOption, data.ExtraOption ?? [])
  await seedModel('Resource', prisma.resource, data.Resource)

  console.log('Resetting id sequences…')
  for (const t of [
    'Course',
    'Lesson',
    'Quiz',
    'Question',
    'AnswerOption',
    'ExtraOption',
    'Resource',
  ]) {
    await resetSequence(t)
  }

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
