// One-off: give the untitled Phase-1 quizzes user-facing names so the lesson
// outline shows real content names instead of generic type labels.
// Run: node --env-file=.env scripts/set-quiz-titles.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const titles = {
  1: 'Rhyming Words',
  2: 'Listening Practice',
  3: 'Consonant Sounds in Words',
  4: 'Vowel Sounds in Words',
  8: 'Consonant Symbols',
  9: 'Vowel Symbols',
  10: 'Diphthong & Triphthong Sounds',
  11: 'Diphthong & Triphthong Symbols',
  12: 'Vowel Quadrilateral',
  13: 'Lexical Chart',
  14: 'Hangman: IPA Spelling',
}

for (const [id, title] of Object.entries(titles)) {
  await prisma.quiz.update({
    where: { id: Number(id) },
    data: { title },
  })
  console.log(`quiz ${id} -> ${title}`)
}

await prisma.$disconnect()
console.log('Done.')
