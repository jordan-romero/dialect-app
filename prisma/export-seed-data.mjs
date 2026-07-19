// Regenerates prisma/seed-data.json from the current database.
// Run with:  node --env-file=.env prisma/export-seed-data.mjs
//
// Exports only CONTENT tables (no user/progress data). Order is the same
// dependency order the seeder uses.

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

async function main() {
  const data = {
    Course: await prisma.course.findMany({ orderBy: { id: 'asc' } }),
    Lesson: await prisma.lesson.findMany({ orderBy: { id: 'asc' } }),
    Resource: await prisma.resource.findMany({ orderBy: { id: 'asc' } }),
    Quiz: await prisma.quiz.findMany({ orderBy: { id: 'asc' } }),
    Question: await prisma.question.findMany({ orderBy: { id: 'asc' } }),
    AnswerOption: await prisma.answerOption.findMany({
      orderBy: { id: 'asc' },
    }),
    ExtraOption: await prisma.extraOption.findMany({ orderBy: { id: 'asc' } }),
  }
  writeFileSync(
    join(__dirname, 'seed-data.json'),
    JSON.stringify(data, null, 2) + '\n',
    'utf-8',
  )
  for (const [k, v] of Object.entries(data)) console.log(`${k}: ${v.length}`)
  console.log('Wrote prisma/seed-data.json')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
