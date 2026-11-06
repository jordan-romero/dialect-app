// One-off: in 13a (lesson 18), show the Blank RP Lexical Template before the
// video — learners fill it in while they watch.
// Run: node --env-file=.env scripts/migrations/lesson18-template-before-video.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.lesson.update({
  where: { id: 18 },
  data: {
    steps: [
      { type: 'description' },
      { type: 'resource' }, // 13a.A Blank RP Lexical Template
      { type: 'video' },
      { type: 'resource' }, // 13a.B Ask List
      { type: 'quiz' }, // 13a.C Repeat After Me
      { type: 'resource' }, // 13a.D Distinct RP Features of Comma
      { type: 'outro' },
    ],
  },
})

console.log('lesson 18 steps updated')
await prisma.$disconnect()
