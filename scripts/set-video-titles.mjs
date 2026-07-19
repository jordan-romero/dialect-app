// One-off: populate each lesson's videoTitle from its video filename so the
// lesson outline shows a real title instead of the generic "Video".
// Run: node --env-file=.env scripts/set-video-titles.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const titleFromUrl = (url) => {
  let name = decodeURIComponent((url || '').split('/').pop() || '')
  name = name.replace(/\.(mp4|mov|webm|m4v)$/i, '').replace(/\+/g, ' ')
  // Strip a leading ordering prefix like "1 ", "13a ", "14b ".
  name = name.replace(/^\s*\d+[a-z]?\s+/i, '')
  return name.trim()
}

const overrides = { 24: 'Outro' }

const lessons = await prisma.lesson.findMany()
for (const l of lessons) {
  const steps = Array.isArray(l.steps) ? l.steps : []
  if (!steps.some((s) => s?.type === 'video')) continue
  if (!l.videoUrl) continue
  const title = overrides[l.id] || titleFromUrl(l.videoUrl)
  if (!title) continue
  await prisma.lesson.update({ where: { id: l.id }, data: { videoTitle: title } })
  console.log(`L${l.id} -> ${title}`)
}

await prisma.$disconnect()
console.log('Done.')
