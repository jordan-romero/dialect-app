// Teacher drill-down: everything a student entered, question by question,
// next to the expected answer. Nothing is scored; the teacher judges. A small
// `matches` hint marks typed answers that equal the expected one once Unicode
// and whitespace are normalised (so the same IPA typed two ways reads equal).
//
// Each exercise type stores UserAnswer.textAnswer differently, and several
// keep their answer key in a JSON file rather than the database. The decoders
// below mirror the components in components/Dashboard/Exercises/.
import { readFileSync } from 'fs'
import { join } from 'path'
import type { AnswerOption, Question } from '@prisma/client'
import { prisma } from './prisma'

export type WorkEntry = {
  label?: string
  student: string | null
  expected: string | null
  matches?: boolean
}

export type WorkQuestion = {
  id: number
  prompt: string
  entries: WorkEntry[]
  note?: string
  savedAt: string | null
}

export type WorkQuiz = {
  id: number
  title: string | null
  quizType: string | null
  instructions: string | null
  submitted: boolean
  savedAt: string | null
  note?: string
  questions: WorkQuestion[]
}

export type WorkLesson = {
  id: number
  title: string
  courseId: number
  courseTitle: string
  progress: number
  completed: boolean
  lastActive: string | null
  quizzes: WorkQuiz[]
}

type Q = Question & { answerOptions: AnswerOption[] }
type Ans = { questionId: number; textAnswer: string; updatedAt: Date }

const DONE_MARKERS = new Set(['completed', 'pending'])

export function normalizeForCompare(s: string | null | undefined): string {
  return (s ?? '')
    .normalize('NFC')
    .trim()
    .replace(/^[/[\]]+|[/[\]]+$/g, '') // /dɑg/ and [dɑg] compare as dɑg
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function entry(
  student: string | null | undefined,
  expected: string | null | undefined,
  label?: string,
): WorkEntry {
  const s = student === undefined || student === '' ? null : student
  const e = expected ?? null
  return {
    ...(label ? { label } : {}),
    student: s,
    expected: e,
    ...(s !== null && e !== null
      ? { matches: normalizeForCompare(s) === normalizeForCompare(e) }
      : {}),
  }
}

function parseJson<T = any>(s: string): T | null {
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

// `{p}retty` → `p̲retty` style is overkill for a table; keep the braces readable.
const showBraces = (s: string) => s.replace(/\{(.+?)\}/g, '[$1]')

// ---- answer-key files for the chart/board exercises ----

const fileCache = new Map<string, any>()
function dataFile(rel: string): any {
  if (!fileCache.has(rel)) {
    try {
      fileCache.set(rel, JSON.parse(readFileSync(join(process.cwd(), rel), 'utf8')))
    } catch {
      fileCache.set(rel, null)
    }
  }
  return fileCache.get(rel)
}

// ---- per-type decoders: (question, saved answer) → entries ----

function optionText(q: Q, id: unknown): string | null {
  const n = Number(id)
  return q.answerOptions.find((o) => o.id === n)?.optionText ?? null
}
const correctOption = (q: Q) => q.answerOptions.find((o) => o.isCorrect) ?? null

function decodeQuestion(quizType: string, q: Q, raw: string | null): Omit<WorkQuestion, 'id' | 'prompt' | 'savedAt'> {
  if (raw === null) {
    return { entries: [entry(null, expectedFor(quizType, q))] }
  }
  switch (quizType) {
    case 'multipleChoice':
    case 'lineBuilder':
      return { entries: [entry(optionText(q, raw), correctOption(q)?.optionText)] }

    case 'matching':
      return { entries: [entry(raw, correctOption(q)?.optionText)] }

    case 'shortAnswer': {
      const typed = parseJson<Record<string, string>>(raw) || {}
      const reveal = q.answerOptions.find((o) => o.audioUrl)
      const inputs = q.answerOptions.filter((o) => !o.audioUrl)
      if (reveal) {
        // Open-ended prompts: the option text is the prompt, not an answer.
        return {
          entries: inputs.map((o) => entry(typed[o.id], null, o.optionText)),
          note: `Revealed sentence: ${reveal.optionText}`,
        }
      }
      return {
        entries: inputs.map((o, i) =>
          entry(typed[o.id], o.optionText, inputs.length > 1 ? `Blank ${i + 1}` : undefined),
        ),
      }
    }

    case 'stressPlacement': {
      const placed = parseJson<(number | null)[]>(raw) || []
      const order = q.answerOptions.filter((o) => o.isCorrect).sort((a, b) => a.id - b.id)
      const n = Math.max(order.length, placed.length)
      return {
        entries: Array.from({ length: n }, (_, i) =>
          entry(optionText(q, placed[i]), order[i]?.optionText, `Blank ${i + 1}`),
        ),
      }
    }

    case 'dragAndDrop':
      return decodeDragAndDrop(q, raw)

    default:
      if (DONE_MARKERS.has(raw)) return { entries: [], note: 'Completed.' }
      return { entries: [entry(raw, null)] }
  }
}

function expectedFor(quizType: string, q: Q): string | null {
  if (['multipleChoice', 'lineBuilder', 'matching'].includes(quizType))
    return correctOption(q)?.optionText ?? null
  return null
}

function decodeDragAndDrop(q: Q, raw: string): Omit<WorkQuestion, 'id' | 'prompt' | 'savedAt'> {
  const byId = new Map(q.answerOptions.map((o) => [o.id, o]))
  const data = parseJson<any>(raw)
  if (q.questionType === 'rhymingPairs') {
    const pairs: [AnswerOption, AnswerOption][] = []
    const seen = new Set<number>()
    q.answerOptions.forEach((o) => {
      const p = o.rhymingWordId ? byId.get(o.rhymingWordId) : undefined
      if (p && !seen.has(o.id) && !seen.has(p.id)) {
        seen.add(o.id)
        seen.add(p.id)
        pairs.push([o, p])
      }
    })
    const matched = new Set<number>((data?.matchedIds || []).map(Number))
    const show = (ps: typeof pairs) =>
      ps.map(([x, y]) => `${x.optionText} ↔ ${y.optionText}`).join(', ')
    const studentPairs = show(pairs.filter(([x, y]) => matched.has(x.id) && matched.has(y.id)))
    if (raw === 'completed') return { entries: [entry(null, show(pairs))], note: 'Completed; the board wasn’t saved.' }
    return { entries: [entry(studentPairs || null, show(pairs), 'Pairs')] }
  }
  // rhymingCategories: buckets saved under "0","1",… (index into categories)
  const cats = q.categories || []
  const nameOf = (key: string) => (/^\d+$/.test(key) && cats[Number(key)] ? cats[Number(key)] : key)
  const expectedIn = (bucket: string) =>
    q.answerOptions
      .filter((o) => (bucket === 'thought' ? o.rhymeCategory !== 'thought' : o.rhymeCategory === bucket))
      .map((o) => o.optionText)
  if (!data || raw === 'completed') {
    return {
      entries: cats.map((c) => entry(null, expectedIn(c).join(', '), c)),
      note: raw === 'completed' ? 'Completed; the board wasn’t saved.' : undefined,
    }
  }
  const placed: Record<string, string[]> = {}
  Object.entries<any[]>(data.categories || {}).forEach(([k, words]) => {
    placed[nameOf(k)] = (words || []).map((w) => w?.optionText ?? String(w))
  })
  return {
    entries: cats.map((c) =>
      entry((placed[c] || []).join(', ') || null, expectedIn(c).join(', '), c),
    ),
  }
}

// symbolPicker keeps the whole quiz on its first question's row:
// {answerOptionId: chosenSymbol}; the expected symbol is the option's question text.
function decodeSymbolPicker(questions: Q[], answers: Map<number, Ans>): WorkQuestion[] {
  let picks: Record<string, string> = {}
  answers.forEach((a) => {
    const j = parseJson<Record<string, string>>(a.textAnswer)
    if (j && typeof j === 'object') picks = { ...picks, ...j }
  })
  return questions.map((q) => ({
    id: q.id,
    prompt: q.text,
    savedAt: answers.get(q.id)?.updatedAt.toISOString() ?? null,
    entries: q.answerOptions.map((o) => entry(picks[o.id], q.text, showBraces(o.optionText))),
  }))
}

// Chart/board exercises whose answer key lives in a JSON file.
function decodeFileBased(quizType: string, raw: string | null): { entries: WorkEntry[]; note?: string } | null {
  const saved = raw && !DONE_MARKERS.has(raw) ? parseJson<any>(raw) : null
  switch (quizType) {
    case 'lexicalChart': {
      const d = dataFile('public/lexicalChartData.json')
      if (!d) return null
      return {
        entries: (d.lexicalItems || []).map((it: any) =>
          entry(saved?.[it.id], it.ipaSymbol, showBraces(it.exampleWord)),
        ),
      }
    }
    case 'consonantRect': {
      const d = dataFile('public/consonantRectangleData.json')
      if (!d) return null
      const slots = [...(d.slots || []), ...(d.specialSlots || [])]
      return {
        entries: slots.map((s: any) =>
          entry(saved?.[s.id], s.symbol, s.label || `${s.voicing} ${s.place} ${s.manner}`),
        ),
      }
    }
    case 'vowelQuad': {
      const d = dataFile('public/vowelQuadrilateralData.json')
      if (!d) return null
      return {
        entries: Object.entries<any>(d.vowelPositions || {})
          .filter(([, v]) => v.isCorrect)
          .map(([k, v]) => entry(saved?.[k]?.vowel ?? null, v.vowel, v.label || k)),
      }
    }
    case 'hangman':
    case 'buildAWord': {
      const d = dataFile(quizType === 'hangman' ? 'public/hangmanIPAData.json' : 'data/buildAWordData.json')
      if (!d) return null
      return {
        entries: (d.questions_data || []).map((w: any) =>
          entry(
            Array.isArray(saved?.[w.id]) ? saved[w.id].map((x: any) => x || '_').join(' ') : null,
            (w.correctAnswer || []).join(' '),
            w.word,
          ),
        ),
      }
    }
    case 'corrections':
    case 'repeatAfterMe':
    case 'buildDiphthongs':
      return {
        entries: [],
        note: raw ? 'Completed. This exercise doesn’t save the student’s individual answers.' : 'Not done yet.',
      }
  }
  return null
}

const FILE_BASED = new Set([
  'lexicalChart',
  'consonantRect',
  'vowelQuad',
  'hangman',
  'buildAWord',
  'corrections',
  'repeatAfterMe',
  'buildDiphthongs',
])

export async function studentWork(userId: number): Promise<WorkLesson[]> {
  const [courses, answers, progress] = await Promise.all([
    prisma.course.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        title: true,
        lessons: {
          orderBy: [{ displayOrder: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
          select: {
            id: true,
            title: true,
            quiz: {
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
              include: {
                questions: {
                  orderBy: { id: 'asc' },
                  include: { answerOptions: { orderBy: { id: 'asc' } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.userAnswer.findMany({
      where: { userId },
      select: { quizId: true, questionId: true, textAnswer: true, updatedAt: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId },
      select: { lessonId: true, progress: true, updatedAt: true },
    }),
  ])

  const byQuiz = new Map<number, Map<number, Ans>>()
  answers.forEach((a) => {
    if (!byQuiz.has(a.quizId)) byQuiz.set(a.quizId, new Map())
    byQuiz.get(a.quizId)!.set(a.questionId, a)
  })
  const prog = new Map(progress.map((p) => [p.lessonId, p]))

  return courses.flatMap((c) =>
    c.lessons.map((l) => {
      let lessonLast: Date | null = prog.get(l.id)?.updatedAt ?? null
      const quizzes: WorkQuiz[] = l.quiz.map((quiz) => {
        const qa = byQuiz.get(quiz.id) || new Map<number, Ans>()
        const type = quiz.quizType || ''
        let last: Date | null = null
        qa.forEach((a) => {
          if (!last || a.updatedAt > last) last = a.updatedAt
        })
        if (last && (!lessonLast || last > lessonLast)) lessonLast = last
        const base = {
          id: quiz.id,
          title: quiz.title,
          quizType: quiz.quizType,
          instructions: quiz.instructions,
          submitted: qa.size > 0,
          savedAt: last ? (last as Date).toISOString() : null,
        }
        if (type === 'symbolPicker') {
          const questions = decodeSymbolPicker(quiz.questions, qa)
          const noPicks =
            base.submitted && questions.every((q) => q.entries.every((e) => e.student === null))
          return {
            ...base,
            questions,
            // Older saves stored `{}`. The exercise only moves on after the
            // right pick, so a finished one was answered correctly throughout.
            note: noPicks
              ? 'Completed. This save didn’t record the individual picks; the exercise only moves on after the correct symbol is chosen.'
              : undefined,
          }
        }
        if (FILE_BASED.has(type)) {
          const raw = qa.values().next().value?.textAnswer ?? null
          const decoded = decodeFileBased(type, raw)
          if (decoded) {
            const q0 = quiz.questions[0]
            return {
              ...base,
              note: decoded.note,
              questions: decoded.entries.length
                ? [
                    {
                      id: q0?.id ?? quiz.id,
                      prompt: q0?.text ?? '',
                      entries: decoded.entries,
                      savedAt: base.savedAt,
                    },
                  ]
                : [],
            }
          }
        }
        return {
          ...base,
          questions: quiz.questions.map((q) => {
            const a = qa.get(q.id)
            return {
              id: q.id,
              prompt: q.text,
              savedAt: a?.updatedAt.toISOString() ?? null,
              ...decodeQuestion(type, q, a?.textAnswer ?? null),
            }
          }),
        }
      })
      const p = prog.get(l.id)
      return {
        id: l.id,
        title: l.title,
        courseId: c.id,
        courseTitle: c.title,
        progress: p?.progress ?? 0,
        completed: (p?.progress ?? 0) >= 100,
        lastActive: lessonLast ? (lessonLast as Date).toISOString() : null,
        quizzes,
      }
    }),
  )
}
