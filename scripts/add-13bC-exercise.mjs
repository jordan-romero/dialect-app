// Build the 13b.C exercise — "Distinct Features of RP in Comma".
//
// The Drive doc "13b.C - Distinct Features of RP in \"Comma\"" asks learners to
// take their transcription of Comma Gets a Cure and add the distinct RP
// features from this module, then check it against 13b.C.2, the answer key.
// This makes that a shortAnswer exercise on Lesson 19: one question per line
// of the passage, typed with the IPA keyboard, and "Reveal Answer" shows that
// line of the key. Lines and key are transcribed from the Drive doc
// "13b.C.2 - Comma RP Answer Key".
//
// Writes the new rows straight to the database (create only — it never
// rewrites existing content the way `yarn seed` does) and records them in
// prisma/seed-data.json. Ids clear the ones reserved by the unbuilt 13b.A
// (quiz 42, question 431) and 14a.B (quiz 41, questions 426-430).
//
// Idempotent. Run: node --env-file=.env scripts/add-13bC-exercise.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')

const QUIZ_ID = 43
const LESSON_ID = 19
const FIRST_QUESTION_ID = 432
const FIRST_OPTION_ID = 1400

const INSTRUCTIONS =
  'Using your existing transcription of Comma Gets a Cure from the previous ' +
  'module, review your work and add in the distinctive features you’ve ' +
  'learned about within this module. Type each line in RP, then reveal the ' +
  'answer key for that line to check your work.'

// [passage line, RP answer key line]
const LINES = [
  [
    "Well, here's a story for you: Sarah Perry was a veterinary nurse who had been",
    'wɛɫ hɪə̆z ə stɔɹĭ fɔ ju ‖ sɛɹə pɛɹĭ wəz ə ˈvɛtɹ̥ɪˌnɛɹĭ nɜs hu hæd bin',
  ],
  [
    'working daily at an old zoo in a deserted district of the territory, so she was',
    'wɜkɪŋ deɪ̆lĭ æt ən əʊ̆ɫd zu ɪn ə dɪzɜtɪd̚ ˈdɪstɹ̥ɪkt əv ðə ˈtɛɹɪˌtɹ̥ĭ | səʊ̆ ʃi wəz',
  ],
  [
    'very happy to start a new job at a superb private practice in north square near',
    'vɛɹĭ hæpĭ tʊ stɑt ə nɪ̆u d͡ʒɒb æt ə sɪ̆uˈpɜb͜ pɹ̥aɪ̆vɪt pɹ̥æktɪs ɪn nɔθ skwɛː nɪə̆',
  ],
  [
    'the Duke Street Tower. That area was much nearer for her and more to her liking.',
    'ðə dɪ̆uk stɹ̥it̚ taʊ̆ə̆ ‖ ðæt ɛɹi.ə wəz mʌt͡ʃ nɪɹə fɔ hə ɹənd mɔ tʊ hɜ laɪ̆kɪŋ ‖',
  ],
  [
    'Even so, on her first morning, she felt stressed. She ate a bowl of porridge,',
    'ivn̩ səʊ̆ | ɒn hə fɜst mɔnɪŋ ʃi fɛlt stɹ̥ɛst ‖ ʃi eɪ̆t ə bəʊ̆ɫ əv pɔɹɪd͡ʒ |',
  ],
  [
    'checked herself in the mirror and washed her face in a hurry. Then she put on a',
    't͡ʃɛkt həsɛɫf ɪn ðə mɪɹə ɹænd wɒʃt hə feɪ̆s ɪn ə hʌɹĭ ‖ ðɛn ʃi pʊt ɒn ə',
  ],
  [
    'plain yellow dress and a fleece jacket, picked up her kit and headed for work.',
    'pl̥eɪ̆n jɛləʊ̆ dɹɛs ənd ə flis d͡ʒækɪt | pɪkt ʌp hə kɪt ænd hɛdɪd fə wɜk ‖',
  ],
  [
    'When she got there, there was a woman with a goose waiting for her. The',
    'wɛn ʃi gɒt ðɛə̆ | ðɛ wɑz ə wʊmn̩ wɪð ə gus weɪ̆tɪŋ fɔ hɜ | ðə',
  ],
  [
    'woman gave Sarah an official letter from the vet. The letter implied that the',
    'wʊmn̩ geɪ̆v sɛɹə ən əfɪʃɫ͜ lɛtə fɹəm ðə vɛt || ðə lɛtəɹɪmplaɪ̆d̚ ðæt ði',
  ],
  [
    'animal could be suffering from a rare form of foot and mouth disease, which was',
    'ænəmɫ̩ kʊd bi sʌfɹɪŋ fɹəm ə ɹɛː fɔm əv fʊt ənd maʊ̆θ dɪziz | wɪt͡ʃ wɑz',
  ],
  [
    'surprising, because normally you would only expect to see it in a dog or a goat.',
    'səpɹ̥aɪ̆zɪŋ | bɪkɒz nɔməlĭ ju wʊd əʊ̆nlĭ ɛkspɛkt̚ tʊ si ɪt ɪn ə dɒg ɔɹə gəʊ̆t ||',
  ],
  [
    'Sarah was sentimental, so this made her feel sorry for the beautiful bird. Before',
    'sɛɹə wəz ˌsɛntɪˈmɛntɫ̩ səʊ̆ ðɪs meɪ̆d hə fiɫ sɒɹĭ fə ðə bɪ̆utɪfɫ̩ bɜd || bɪfɔ',
  ],
  [
    'long, that itchy goose began to strut around the office like a lunatic, which made',
    'lɒŋ ðæt ɪt͡ʃĭ gus bɪgæn tʊ stɹ̥ʌt əɹaʊ̆nd̚ ði ɒfɪs laɪ̆k ə lunətɪk | wɪt͡ʃ meɪ̆d',
  ],
  [
    'an unsanitary mess. The goose\'s owner, Mary Harrison, kept calling, "Comma,',
    'ən ˌənˈsænɪtɹĭ mɛs || ðə gusɪz əʊ̆nə mɛɹĭ hæɹɪsn̩ kɛpt kɔlɪŋ kɒmə |',
  ],
  [
    'Comma," which Sarah thought was an odd choice for a name. Comma was',
    'kɒmə | wɪt͡ʃ sɛɹə θɔt wəz ən ɒd̚ t͡ʃɔɪ̆s fɔɹə neɪ̆m || kɒmə wəz',
  ],
  [
    'strong and huge, so it would take some force to trap her, but Sarah had a',
    'stɹ̥ɒŋ ænd çɪ̆ud͡ʒ | səʊ̆ ɪt wʊd teɪ̆k sʌm fɔs tʊ tɹ̥æp hə | bət sɛɹə hæd ə',
  ],
  [
    "different idea. First she tried gently stroking the goose's lower back with her",
    'dɪfɹɪnt aɪ̆ˈdi.ə || fɜst ʃi tɹ̥aɪ̆d̚ d͡ʒɛntlĭ stɹ̥əʊ̆kɪŋ ðə gusɪz ləʊ̆ə̆ bæk wɪð hə',
  ],
  [
    'palm, then singing a tune to her. Finally, she administered ether. Her efforts',
    'pɑm | ðɛn ˈsɪŋɪŋ ə tɪ̆un tʊ hɜ || faɪ̆nlĭ | ʃi ədˈmɪˌnɪstəd iθə || həɹɛfəts',
  ],
  [
    'were not futile. In no time, the goose began to tire, so Sarah was able to hold',
    'wə nɒt ˈfɪ̆utaɪ̆l || ɪn nəʊ̆ taɪ̆m | ðə gus bəgæn tʊ taɪ̆ə̆ | səʊ̆ sɛɹə wəz eɪ̆bɫ̩ tə həʊ̆ɫd',
  ],
  [
    'onto Comma and give her a relaxing bath. Once Sarah had managed to bathe',
    'ɒntʊ kɒmə ɹænd gɪv hɜ ɹə ɹɪlæksɪŋ bɑθ || wʌns͜ sɛɹə hæd mænɪd͡ʒd̚ tʊ beɪ̆ð͜',
  ],
  [
    'the goose, she wiped her off with a cloth and laid her on her right side.',
    'ðə gus | ʃi waɪ̆pt həɹɒf wɪð ə klɒθ || ænd leɪ̆d hə ɹɒn hə ɹaɪ̆t saɪ̆d',
  ],
  [
    'Then Sarah confirmed the vet’s diagnosis. Almost immediately, she remembered',
    'ðɛn ʃɛɹə kənfɜmd̚ ðə vɛts ˌdaɪ̆.əgˈnəʊ̆sɪs || ɒɫməʊ̆st ɪˈmiˌdi.ə̆tlĭ | ʃi ɹɪmɛmbəd',
  ],
  [
    'an effective treatment that required her to measure out a lot of medicine.',
    'ən ɪfɛktɪv tɹ̥itmɪnt ðæt ɹɪkwaɪ̆ə̆d hɜ tʊ mɛʒəɹaʊ̆t ə lɒt əv mɛdɪsɪn ||',
  ],
  [
    'Sarah warned that this course of treatment might be expensive–either five',
    'ʃɛɹə wɔnd̚ ðæt ðɪs kɔs ə tɹ̥itmɪnt maɪ̆t bi ɪkspɛnsɪv || aɪ̆ðə',
  ],
  [
    'or six times the cost of penicillin. I can’t imagine paying so much,',
    'faɪ̆v ɔ sɪks taɪ̆mz ðə kɒst əv ˌpɛnɪˈsɪlɪn || aɪ̆ kɑnt ɪmæd͡ʒn̩ pe.ɪŋ səʊ̆ mʌt͡ʃ',
  ],
  [
    'but Mrs. Harrison—a millionaire lawyer—thought it was a fair price for a cure.',
    'bət ˈmɪsɪz hæɹɪsn̩ || ə mɪljəˈnɛː lɔɪ̆ə̆ || θɔt ɪt wəz ə fɛː pɹ̥aɪ̆s fɔɹə kçʊə̆',
  ],
]

const quiz = {
  id: QUIZ_ID,
  title: 'Distinct Features of RP in “Comma”',
  lessonId: LESSON_ID,
  score: null,
  passScore: 70,
  hasBeenAttempted: false,
  quizType: 'shortAnswer',
  order: 1, // after 13b.B (quiz 39, order 0)
  isCompleted: false,
  instructions: INSTRUCTIONS,
}
const questions = LINES.map(([text], i) => ({
  id: FIRST_QUESTION_ID + i,
  text,
  questionType: 'shortAnswer',
  quizId: QUIZ_ID,
  categories: [],
  audioUrl: null,
}))
const options = LINES.map(([, key], i) => ({
  id: FIRST_OPTION_ID + i,
  optionText: key,
  isCorrect: true,
  rhymeCategory: null,
  rhymingWordId: null,
  audioUrl: null,
  feedback: null,
  questionId: FIRST_QUESTION_ID + i,
}))

// Slot the exercise in after the last quiz step, so the lesson runs
// 13b.B → 13b.C → 13b.C.2 (the answer key PDF).
const withQuizStep = (steps) => {
  const out = [...(steps ?? [])]
  const lastQuiz = out.map((s) => s.type).lastIndexOf('quiz')
  out.splice(lastQuiz + 1, 0, { type: 'quiz' })
  return out
}

const prisma = new PrismaClient()

if (await prisma.quiz.findUnique({ where: { id: QUIZ_ID } })) {
  console.log(`quiz ${QUIZ_ID} already exists — nothing to do`)
  await prisma.$disconnect()
  process.exit(0)
}
const qIds = questions.map((q) => q.id)
const oIds = options.map((o) => o.id)
const taken = [
  ...(await prisma.question.findMany({ where: { id: { in: qIds } } })),
  ...(await prisma.answerOption.findMany({ where: { id: { in: oIds } } })),
]
if (taken.length) {
  console.error(
    'REFUSING TO WRITE — ids already in use:',
    taken.map((r) => r.id),
  )
  process.exit(1)
}

const lesson = await prisma.lesson.findUnique({ where: { id: LESSON_ID } })
const steps = withQuizStep(lesson.steps)
console.log(
  `quiz ${QUIZ_ID} + ${questions.length} questions + ${options.length} options`,
)
console.log(
  `lesson ${LESSON_ID} steps: ${steps.map((s) => s.type).join(' → ')}`,
)

if (DRY) {
  console.log('\n--dry-run: nothing written')
  await prisma.$disconnect()
  process.exit(0)
}

await prisma.$transaction([
  prisma.quiz.create({ data: quiz }),
  prisma.question.createMany({ data: questions }),
  prisma.answerOption.createMany({ data: options }),
  prisma.lesson.update({ where: { id: LESSON_ID }, data: { steps } }),
])
// Explicit ids don't advance the autoincrement sequences; bump them past the
// new rows so the next app-created row doesn't collide.
for (const t of ['Quiz', 'Question', 'AnswerOption']) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${t}"', 'id'),
       (SELECT COALESCE(MAX(id), 1) FROM "${t}"), true)`,
  )
}
await prisma.$disconnect()
console.log('written to the database')

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
data.Quiz.push(quiz)
data.Question.push(...questions)
data.AnswerOption.push(...options)
const seedLesson = data.Lesson.find((l) => l.id === LESSON_ID)
seedLesson.steps = withQuizStep(seedLesson.steps)
writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
console.log('recorded in prisma/seed-data.json')
