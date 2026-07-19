// One-off: the file-based exercises vowelQuad / lexicalChart / hangman had JSON
// `id`/`questions[].id` pointing at the WRONG (unrelated) quizzes — so completion
// was written to the wrong rows and the lesson never unlocked Next on reload.
//
// This creates a single marker question on each real quiz (12/13/14, which had
// none) and realigns each /public JSON to the correct quiz + question id.
// Run: node --env-file=.env scripts/fix-filebased-quiz-ids.mjs
import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const prisma = new PrismaClient()

const targets = [
  {
    quizId: 12,
    lessonId: 8,
    file: 'vowelQuadrilateralData.json',
    type: 'vowelQuad',
    text: 'Place the correct vowel symbols on the IPA vowel chart',
  },
  {
    quizId: 13,
    lessonId: 25,
    file: 'lexicalChartData.json',
    type: 'lexicalChart',
    text: 'Place each IPA symbol in its correct spot on the lexical chart.',
  },
  {
    quizId: 14,
    lessonId: 25,
    file: 'hangmanIPAData.json',
    type: 'hangman',
    text: 'Fill in the blanks with the correct IPA symbols.',
  },
]

for (const t of targets) {
  // Reuse an existing question on the quiz if there is one; otherwise create a
  // single marker question used purely for completion tracking.
  let q = await prisma.question.findFirst({ where: { quizId: t.quizId } })
  if (!q) {
    q = await prisma.question.create({
      data: { text: t.text, questionType: t.type, quizId: t.quizId },
    })
    console.log(`Created marker question ${q.id} on quiz ${t.quizId}`)
  } else {
    console.log(`Reusing question ${q.id} on quiz ${t.quizId}`)
  }

  const path = join(process.cwd(), 'public', t.file)
  const j = JSON.parse(readFileSync(path, 'utf-8'))
  j.id = t.quizId
  j.lessonId = t.lessonId
  if (!Array.isArray(j.questions) || j.questions.length === 0) {
    j.questions = [{ id: q.id, text: t.text }]
  }
  j.questions[0].id = q.id
  j.questions[0].quizId = t.quizId
  writeFileSync(path, JSON.stringify(j, null, 2) + '\n')
  console.log(`  Patched ${t.file} -> id ${t.quizId}, question ${q.id}`)
}

await prisma.$disconnect()
console.log('Done.')
