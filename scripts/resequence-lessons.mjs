// 1) Remove the orphan hangman quiz (14) from Checkpoint 1 (no Drive source).
// 2) Re-sequence each lesson's steps + resource/quiz order to match the Drive
//    A/B/C/D order, and drop phantom quiz steps (slots with no real quiz).
// Run: node --env-file=.env scripts/resequence-lessons.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---- 1) delete orphan quiz 14 (and its dependents) -------------------------
const q14 = await prisma.quiz.findUnique({ where: { id: 14 } })
if (q14) {
  const qids = (
    await prisma.question.findMany({ where: { quizId: 14 }, select: { id: true } })
  ).map((q) => q.id)
  await prisma.userAnswer.deleteMany({ where: { quizId: 14 } })
  if (qids.length) {
    await prisma.answerOption.deleteMany({ where: { questionId: { in: qids } } })
    await prisma.extraOption.deleteMany({ where: { questionId: { in: qids } } })
    await prisma.userAnswer.deleteMany({ where: { questionId: { in: qids } } })
    await prisma.question.deleteMany({ where: { quizId: 14 } })
  }
  await prisma.quiz.delete({ where: { id: 14 } })
  console.log('Deleted orphan quiz 14 (+ question/options/answers)')
}

// ---- 2) Drive-ordered content sequence per lesson --------------------------
// Each entry: ['res'|'quiz', id] in the exact order it should appear.
const sequences = {
  6: [['res', 10], ['quiz', 33], ['res', 12], ['res', 13], ['quiz', 3], ['quiz', 8]],
  8: [['res', 14], ['quiz', 12], ['res', 17], ['quiz', 4], ['quiz', 9]],
  13: [['quiz', 22], ['res', 48], ['quiz', 23], ['quiz', 25], ['res', 49], ['res', 18]],
  14: [['quiz', 26], ['quiz', 24], ['res', 50], ['quiz', 27]],
  17: [['res', 22], ['res', 23], ['res', 24], ['res', 25]],
  19: [['res', 29]],
  20: [['res', 30], ['res', 31], ['res', 32], ['res', 33], ['res', 34]],
  21: [['res', 36], ['res', 37]],
  22: [['res', 38], ['res', 39], ['res', 40], ['res', 41]],
  23: [['res', 35], ['quiz', 28]],
  25: [['quiz', 13], ['quiz', 29], ['quiz', 30], ['quiz', 32], ['quiz', 31]],
}

for (const [lessonIdStr, seq] of Object.entries(sequences)) {
  const lessonId = Number(lessonIdStr)
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  const cur = Array.isArray(lesson.steps) ? lesson.steps : []
  const hasDesc = cur.some((s) => s?.type === 'description')
  const hasVideo = cur.some((s) => s?.type === 'video')
  const hasOutro = cur.some((s) => s?.type === 'outro')

  // Assign resource.order / quiz.order from the sequence position.
  let rc = 0
  let qc = 0
  for (const [kind, id] of seq) {
    if (kind === 'res') {
      await prisma.resource.update({ where: { id }, data: { order: rc++ } })
    } else {
      await prisma.quiz.update({ where: { id }, data: { order: qc++ } })
    }
  }

  // Rebuild steps: description, video, <content tokens>, outro.
  const steps = []
  if (hasDesc) steps.push({ type: 'description' })
  if (hasVideo) steps.push({ type: 'video' })
  for (const [kind] of seq) {
    steps.push({ type: kind === 'res' ? 'resource' : 'quiz' })
  }
  if (hasOutro) steps.push({ type: 'outro' })

  await prisma.lesson.update({ where: { id: lessonId }, data: { steps } })
  console.log(
    `L${lessonId}: ${seq.length} items, steps=[${steps.map((s) => s.type).join(', ')}]`,
  )
}

await prisma.$disconnect()
console.log('Done.')
