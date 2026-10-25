// One-off: turn the broken "quiz 15" (quizType "C", wrong Comma audio) into the
// proper 13a.C "Repeat After Me" exercise, and clean up lesson 18's outline.
// Run: node --env-file=.env scripts/fix-lesson18-repeataftme.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 1) Fix the quiz: real type, order 0 (only quiz in the lesson), a title.
await prisma.quiz.update({
  where: { id: 15 },
  data: {
    quizType: 'repeatAfterMe',
    order: 0,
    title: 'Repeat After Me: Tongue Twisters',
  },
})

// 2) The single marker question used for completion tracking.
await prisma.question.update({
  where: { id: 49 },
  data: {
    text: 'Repeat After Me: Tongue Twisters',
    questionType: 'marker',
    audioUrl: null,
  },
})

// 3) Remove the mis-attached "Comma Gets a Cure" answer option (that audio
//    belongs to the Prosody lesson, folder 13c — not here).
const deleted = await prisma.answerOption.deleteMany({
  where: { questionId: 49 },
})
console.log(`Removed ${deleted.count} stale answer option(s) from Q49`)

// 4) Fix the lesson outline: 3 resources (A, B, D) with the exercise (C)
//    between B and D, and drop the two phantom quiz steps.
//    expandLessonSteps turns the two leading resource steps into A & B and the
//    trailing one into D, with the quiz (C) in the middle → A, B, C, D.
await prisma.lesson.update({
  where: { id: 18 },
  data: {
    steps: [
      { type: 'description' },
      { type: 'video' },
      { type: 'resource' },
      { type: 'resource' },
      { type: 'quiz' },
      { type: 'resource' },
      { type: 'outro' },
    ],
  },
})

await prisma.$disconnect()
console.log('Lesson 18 repeat-after-me fix complete.')
