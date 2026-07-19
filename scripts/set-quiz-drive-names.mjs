// Rename every quiz to the name it's actually called in the Drive source, so
// the lesson outline reads like the course materials (not code identifiers).
// Run: node --env-file=.env scripts/set-quiz-drive-names.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// quizId -> Drive exercise name (the descriptive part, minus the A/B/C letter).
const names = {
  1: 'Rhyming Words', // 2B
  2: 'Speaking Without Consonants', // 4B
  33: 'Interactive Consonant Rectangle', // 5B
  3: 'Multiple Choice Quiz', // 5D
  8: 'Choose the Right Symbol', // 5E
  12: 'Interactive Vowel Quadrilateral', // 6B
  4: 'Multiple Choice Quiz', // 6D
  9: 'Choose the Right Symbol', // 6E
  10: 'Multiple Choice Quiz (two ways)', // 7C
  11: 'Choose the Right Symbol', // 7D
  22: 'Transcription Matching', // 8A
  23: 'Regional Options', // 8B
  25: 'Simple Transcription', // 8C
  26: 'Film Quotes', // 9A
  24: 'Connected Speech Matching', // 9B
  27: 'Descriptive Transcription', // 9C
  34: 'Syllabic Stress: Noun vs. Verb', // 10B
  35: 'Stress Suprasegmentals', // 10C
  15: 'Repeat After Me Tongue Twisters', // 13a.C
  28: 'Practice RP Changes', // 14a.C
  // Checkpoint Exercise 1
  13: 'Blank Lexical Chart', // CP1 A
  29: 'Matching', // CP1 B
  30: 'Reading Comprehension', // CP1 C
  32: 'Build-a-Word', // CP1 D
  31: 'Corrections', // CP1 E
  14: 'Build-a-Word (Hangman)', // no Drive equivalent — app-only variant
  // Checkpoint Exercise 2
  36: 'Hamlet’s Advice pt. 1', // CP2 A
  37: 'Hamlet’s Advice pt. 2', // CP2 B
  38: 'Hamlet’s Advice pt. 3', // CP2 C
}

for (const [id, title] of Object.entries(names)) {
  await prisma.quiz.update({ where: { id: Number(id) }, data: { title } })
  console.log(`quiz ${id} -> ${title}`)
}

await prisma.$disconnect()
console.log('Done.')
