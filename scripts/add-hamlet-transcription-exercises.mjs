// Build the two Hamlet's Advice transcription exercises as shortAnswer
// (type-and-reveal) quizzes, the same shape as 13b.C:
//
//   Checkpoint 2 E — "Hamlet's Advice pt. 4" (Lesson 26): lines 8–14 in GenAm,
//     checked against CP2 F, the full GenAm transcription.
//   14b.A — "Transcribing Hamlet's Advice into RP" (Lesson 21): all 14 lines
//     in RP, checked against 14b.B, the RP answer key.
//
// One question per line, typed with the IPA keyboard; "Reveal Answer" shows
// that line of the key. Lines and keys are transcribed from the Drive docs
// (the keys' red/underline highlighting doesn't carry over — the reveal is
// plain text). Each exercise replaces the worksheet PDF it was built from;
// those rows are removed from the lesson, but stay in the git history of
// prisma/seed-data.json and on S3.
//
// Writes straight to the database (create only — never re-seeds) and records
// the change in prisma/seed-data.json.
//
// Idempotent. Run: node --env-file=.env scripts/add-hamlet-transcription-exercises.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const EXERCISES = [
  {
    quizId: 44,
    lessonId: 26,
    title: 'Hamlet’s Advice pt. 4',
    order: 3, // after pt. 3 (quiz 38)
    firstQuestionId: 460,
    firstOptionId: 1430,
    replacesResourceId: 43, // "Hamlet's Advice pt. 4" worksheet PDF
    // description, A (context), pt. 1–3, pt. 4, then F + G (answer key, text)
    steps: [
      'description',
      'resource',
      'quiz',
      'quiz',
      'quiz',
      'quiz',
      'resource',
      'outro',
    ],
    instructions:
      'Transcribe the remainder of “Hamlet’s Advice” on your own, one line ' +
      'at a time in GenAm. After each line, reveal the answer key to check ' +
      'your work.',
    lines: [
      [
        '8. Suit the action to the word, the word to the action,',
        'sut̚ ðĭ ækʃn̩ tʊ ðə wɝd | ðə wɝd tʊ ðĭ ækʃn̩ |',
      ],
      [
        "9. with this special observance, that you o'erstep not the modesty of nature.",
        'wɪθ͜ ðɪs spɛʃɫ̩ əbzɝvn̩s | ðæt ju ɔɚ̆stɛp nɑt̚ ðə mɑdəstĭ əv neɪ̆t͡ʃɚ ||',
      ],
      [
        '10. For anything so o’erdone is from the purpose of playing,',
        'fɔɚ̆ ɛnĭθɪŋ soʊ̆ ɔɚ̆dʌn ɪz fɹʌm ðə pɝpɪs əv ple.ɪŋ',
      ],
      [
        '11. whose end, both at the first and now,',
        'huz ɛnd | boʊ̆θ æt̚ ðə fɝst ænd̚ naʊ̆',
      ],
      [
        '12. was and is to hold as ’twere, the mirror up to nature:',
        'wʌz ænd ɪz tʊ hoʊ̆ɫd æz twɝ | ðə mɪɹɚ ʌp tʊ neɪ̆t͡ʃɚ',
      ],
      [
        '13. to show virtue her feature, scorn her own image,',
        'tʊ ʃoʊ̆ vɝt͡ʃu hɚ fit͡ʃɚ | skɔɚ̆n hɚ oʊ̆n ɪməd͡ʒ',
      ],
      [
        '14. and the very age and body of the time his form and pressure.',
        'ænd ðə vɛɚ̆.ĭ eɪ̆d͡ʒ ænd bɑɾĭ əv ðə taɪ̆m hɪz fɔɚ̆m ænd pɹɛʃɚ',
      ],
    ],
  },
  {
    quizId: 45,
    lessonId: 21,
    title: 'Transcribing Hamlet’s Advice into RP',
    order: 0,
    firstQuestionId: 470,
    firstOptionId: 1440,
    replacesResourceId: 36, // "Transcribing Hamlet's Advice into RP" PDF
    // description, video, 14b.A, then 14b.B (the RP answer key)
    steps: ['description', 'video', 'quiz', 'resource', 'outro'],
    instructions:
      'Fully transcribe “Hamlet’s Advice” into British RP, one line at a ' +
      'time. Reference your GenAm transcription from Checkpoint Exercise 2, ' +
      'your Lexical Chart and the provided audio sample. After each line, ' +
      'reveal the answer key to check your work.',
    lines: [
      [
        'Speak the speech, I pray you, as I pronounced it to you,',
        'spik ðə spit͡ʃ | aɪ̆ pɹeɪ̆ ju | æz aɪ̆ pɹənaʊ̆nst ɪt̚ tʊ ju |',
      ],
      [
        'trippingly on the tongue. But if you mouth it, as many of your players do,',
        'tɹɪpɪŋlɪ ɒn ðə tʌŋ || bət ɪf ju maʊ̆ð ɪt | æz mɛnɪ əv jɔ plɛɪ̆ə̆z du |',
      ],
      [
        'I had as lief the town-crier spoke my lines.',
        'aɪ̆ hæd æz lif ðə taʊ̆n kɹaɪ̆ə̆ spəʊ̆k maɪ̆ laɪ̆nz ||',
      ],
      [
        'Nor do not saw the air too much with your hand thus, but use all gently,',
        'nɔ du nɒt sɔ ði ɛː tu mʌt͡ʃ wɪð jɔ hænd ðʌs | bət juz ɔɫ d͡ʒɛntlɪ ||',
      ],
      [
        'for in the very torrent, tempest, and, as I may say, whirlwind of your passion,',
        'fɔ ɹɪn ðə vɛɹɪ tɒɹənt | tɛmpəst | ænd æz aɪ̆ meɪ̆ seɪ̆ wɜɫwɪnd əv jɔ pæʃn̩ |',
      ],
      [
        'you must acquire and beget a temperance that may give it smoothness.',
        'ju mʌst əkwaɪ̆ə̆ ɹænd bɪgɛt ə tɛmpɹəns ðæt meɪ̆ gɪv ɪt smuðnəs ||',
      ],
      [
        'Be not too tame neither, but let your own discretion be your tutor.',
        'bi nɒt̚ tu teɪ̆m naɪ̆ðə | bət lɛt jɔ ɹəʊ̆n dɪskɹɛʃn̩ bi jɔ tɪ̆utə ||',
      ],
      [
        'Suit the action to the word, the word to the action,',
        'sɪ̆ut ðĭ ɛkʃn̩ tʊ ðə wɜd | ðə wɜd tʊ ðĭ ɛkʃn̩ |',
      ],
      [
        "with this special observance, that you o'erstep not the modesty of nature.",
        'wɪð͜ ðɪs spɛʃɫ̩ əbzɜvn̩s | ðæt ju ɔstɛp nɒt ðə mɒdəstĭ əv neɪ̆t͡ʃə ||',
      ],
      [
        'For anything so o’erdone is from the purpose of playing,',
        'fɔ ɹɛnɪθɪŋ səʊ̆ ɔdʌn ɪz fɹʌm ðə pɜpɪs əv ple.ɪŋ',
      ],
      [
        'whose end, both at the first and now,',
        'huz ɛnd | bəʊ̆θ æt ðə fɜst ænd naʊ̆',
      ],
      [
        'was and is to hold as ’twere, the mirror up to nature:',
        'wʌz ænd ɪz tʊ həʊ̆ɫd æz twɜ | ðə mɪɹə ɹʌp tʊ neɪ̆t͡ʃə',
      ],
      [
        'to show virtue her feature, scorn her own image,',
        'tʊ ʃəʊ̆ vɜt͡ʃu hə fit͡ʃə | skɔn hə ɹəʊ̆n ɪmɪd͡ʒ',
      ],
      [
        'and the very age and body of the time his form and pressure.',
        'ænd ðə vɛɹɪ eɪ̆d͡ʒ ænd bɒdɪ əv ðə taɪ̆m hɪz fɔːm ænd pɹɛʃə',
      ],
    ],
  },
]

const rowsFor = (ex) => ({
  quiz: {
    id: ex.quizId,
    title: ex.title,
    lessonId: ex.lessonId,
    score: null,
    passScore: 70,
    hasBeenAttempted: false,
    quizType: 'shortAnswer',
    order: ex.order,
    isCompleted: false,
    instructions: ex.instructions,
  },
  questions: ex.lines.map(([text], i) => ({
    id: ex.firstQuestionId + i,
    text,
    questionType: 'shortAnswer',
    quizId: ex.quizId,
    categories: [],
    audioUrl: null,
  })),
  options: ex.lines.map(([, key], i) => ({
    id: ex.firstOptionId + i,
    optionText: key,
    isCorrect: true,
    rhymeCategory: null,
    rhymingWordId: null,
    audioUrl: null,
    feedback: null,
    questionId: ex.firstQuestionId + i,
  })),
  steps: ex.steps.map((type) => ({ type })),
})

const prisma = new PrismaClient()
const todo = []
for (const ex of EXERCISES) {
  if (await prisma.quiz.findUnique({ where: { id: ex.quizId } })) {
    console.log(`quiz ${ex.quizId} already exists — skipping ${ex.title}`)
    continue
  }
  const r = rowsFor(ex)
  const taken = [
    ...(await prisma.question.findMany({
      where: { id: { in: r.questions.map((q) => q.id) } },
    })),
    ...(await prisma.answerOption.findMany({
      where: { id: { in: r.options.map((o) => o.id) } },
    })),
  ]
  if (taken.length) {
    console.error(`REFUSING TO WRITE — ids already in use for ${ex.title}`)
    process.exit(1)
  }
  // The new step list must still account for every quiz and resource.
  const quizzes = await prisma.quiz.count({ where: { lessonId: ex.lessonId } })
  const resources = await prisma.resource.count({
    where: { lessonId: ex.lessonId, id: { not: ex.replacesResourceId } },
  })
  const qSteps = ex.steps.filter((s) => s === 'quiz').length
  const rSteps = ex.steps.filter((s) => s === 'resource').length
  if (qSteps !== quizzes + 1 || rSteps > resources || (resources && !rSteps)) {
    console.error(`steps don't line up for lesson ${ex.lessonId} — aborting`)
    process.exit(1)
  }
  console.log(
    `${ex.title}: quiz ${ex.quizId} + ${r.questions.length} lines on lesson ${ex.lessonId}, ` +
      `replacing resource ${ex.replacesResourceId}\n  steps: ${ex.steps.join(
        ' → ',
      )}`,
  )
  todo.push({ ex, r })
}

if (DRY || !todo.length) {
  if (DRY) console.log('\n--dry-run: nothing written')
  await prisma.$disconnect()
  process.exit(0)
}

for (const { ex, r } of todo) {
  await prisma.$transaction([
    prisma.quiz.create({ data: r.quiz }),
    prisma.question.createMany({ data: r.questions }),
    prisma.answerOption.createMany({ data: r.options }),
    prisma.resource.deleteMany({ where: { id: ex.replacesResourceId } }),
    prisma.lesson.update({
      where: { id: ex.lessonId },
      data: { steps: r.steps },
    }),
  ])
}
for (const t of ['Quiz', 'Question', 'AnswerOption']) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${t}"', 'id'),
       (SELECT COALESCE(MAX(id), 1) FROM "${t}"), true)`,
  )
}
await prisma.$disconnect()
console.log('written to the database')

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
for (const { ex, r } of todo) {
  data.Quiz.push(r.quiz)
  data.Question.push(...r.questions)
  data.AnswerOption.push(...r.options)
  data.Resource = data.Resource.filter((x) => x.id !== ex.replacesResourceId)
  data.Lesson.find((l) => l.id === ex.lessonId).steps = r.steps
}
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log('recorded in prisma/seed-data.json')
