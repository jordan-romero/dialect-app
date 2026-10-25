import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Grid, Text, VStack } from '@chakra-ui/react'
import useQuiz from './utils'
import { Question } from './QuizTypes'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { shuffleArray } from './shuffle'
import { postQuizAnswers, fetchQuizProgress } from './quizApi'

interface MatchingExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

/**
 * The 36 pairs are authored as one question each ("In the frame /b_t/, which
 * word does [ɛ] make?"), but the exercise is a matching grid: one frame, its
 * symbols down one side and its words down the other. Frames are recovered
 * from the question text rather than stored separately, so the answer keys
 * stay in the one place they are already maintained.
 */
const FRAME_RE = /^In the frame (.+?), which word does \[(.+?)\] make\?$/

/** Both columns use this so a word always sits level with a symbol row. */
const ROW_HEIGHT = '52px'

interface Pair {
  questionId: number
  symbol: string
  correctWord: string
}
interface FrameGroup {
  frame: string
  pairs: Pair[]
  words: string[]
}

/** Either side can be picked first, so a pending pick is one or the other. */
type Selection =
  | { frame: string; kind: 'symbol'; questionId: number }
  | { frame: string; kind: 'word'; word: string }
  | null

const groupByFrame = (questions: Question[]): FrameGroup[] => {
  const byFrame = new Map<string, FrameGroup>()
  for (const q of questions) {
    const match = String(q.text).trim().match(FRAME_RE)
    if (!match) continue
    const [, frame, symbol] = match
    const correct = (q.answerOptions ?? []).find((o) => o.isCorrect)
    if (!correct) continue
    let group = byFrame.get(frame)
    if (!group) {
      group = { frame, pairs: [], words: [] }
      byFrame.set(frame, group)
    }
    group.pairs.push({
      questionId: q.id,
      symbol,
      correctWord: correct.optionText,
    })
  }
  // Every option of a question is a word from that same frame, so the word
  // column is just the frame's own answers.
  for (const group of Array.from(byFrame.values())) {
    group.words = group.pairs.map((p) => p.correctWord)
  }
  return Array.from(byFrame.values())
}

const MatchingExercise: React.FC<MatchingExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const quizData = useMemo(
    () => quizzes?.find((q) => q.order === quizIndex),
    [quizzes, quizIndex],
  )

  /** questionId -> the word the learner put against that symbol */
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [selection, setSelection] = useState<Selection>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const groups = useMemo(
    () => groupByFrame(quizData?.questions ?? []),
    [quizData?.questions],
  )

  // Authored in matching order, which gives the answers away. Shuffled once
  // per quiz so the columns stay put while the learner works. The two columns
  // are shuffled independently, so a row is never its own answer.
  const signature = groups.map((g) => g.frame).join('|')
  const shuffled = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        pairs: shuffleArray(g.pairs),
        words: shuffleArray(g.words),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature],
  )

  useEffect(() => {
    const load = async () => {
      if (!quizData) return
      const data = await fetchQuizProgress(quizData.id, lessonId)
      if (!data) return
      setIsCompleted(data.isCompleted)
      const restored: Record<number, string> = {}
      for (const a of data.answers) {
        if (a.textAnswer && a.textAnswer !== 'pending') {
          restored[a.questionId] = a.textAnswer
        }
      }
      if (Object.keys(restored).length) setAnswers(restored)
    }
    load()
  }, [quizData, lessonId])

  const allCorrect = useMemo(() => {
    const pairs = groups.flatMap((g) => g.pairs)
    return (
      pairs.length > 0 &&
      pairs.every((p) => answers[p.questionId] === p.correctWord)
    )
  }, [groups, answers])

  /** Put `word` against `questionId`, freeing it from any other symbol first. */
  const assign = (group: FrameGroup, questionId: number, word: string) => {
    setAnswers((prev) => {
      const next = { ...prev }
      // A word can only be used once per frame.
      for (const p of group.pairs) {
        if (next[p.questionId] === word) delete next[p.questionId]
      }
      next[questionId] = word
      return next
    })
    setSelection(null)
  }

  const pickSymbol = (group: FrameGroup, pair: Pair) => {
    if (isCompleted) return
    // A filled symbol clears, matching the other place-into-slot exercises.
    if (answers[pair.questionId]) {
      setAnswers((prev) => {
        const next = { ...prev }
        delete next[pair.questionId]
        return next
      })
      setSelection(null)
      return
    }
    // A word is already waiting — complete the pair.
    if (selection?.kind === 'word' && selection.frame === group.frame) {
      assign(group, pair.questionId, selection.word)
      return
    }
    setSelection((prev) =>
      prev?.kind === 'symbol' && prev.questionId === pair.questionId
        ? null
        : { frame: group.frame, kind: 'symbol', questionId: pair.questionId },
    )
  }

  const pickWord = (group: FrameGroup, word: string) => {
    if (isCompleted) return
    // Clicking a word that is already matched releases it.
    const owner = group.pairs.find((p) => answers[p.questionId] === word)
    if (owner) {
      setAnswers((prev) => {
        const next = { ...prev }
        delete next[owner.questionId]
        return next
      })
      setSelection(null)
      return
    }
    // A symbol is already waiting — complete the pair.
    if (selection?.kind === 'symbol' && selection.frame === group.frame) {
      assign(group, selection.questionId, word)
      return
    }
    setSelection((prev) =>
      prev?.kind === 'word' && prev.word === word && prev.frame === group.frame
        ? null
        : { frame: group.frame, kind: 'word', word },
    )
  }

  const handleFinish = async () => {
    if (!quizData) return
    setIsLoading(true)
    try {
      const ok = await postQuizAnswers({
        quizId: quizData.id,
        lessonId,
        answers: quizData.questions.map((q) => ({
          questionId: q.id,
          textAnswer: answers[q.id] ?? '',
        })),
      })
      if (ok) setIsCompleted(true)
    } finally {
      setIsLoading(false)
    }
    onComplete()
  }

  if (!quizData || shuffled.length === 0) return <QuizSkeleton />

  const renderSymbolRow = (group: FrameGroup, pair: Pair) => {
    const placed = answers[pair.questionId]
    const isCorrect = placed === pair.correctWord
    const isWrong = !!placed && !isCorrect
    const isSelected =
      selection?.kind === 'symbol' && selection.questionId === pair.questionId
    return (
      <Flex
        as="button"
        type="button"
        aria-label={`Symbol ${pair.symbol}${
          placed ? `, matched to ${placed}` : ', unmatched'
        }${isCorrect ? ', correct' : isWrong ? ', incorrect' : ''}`}
        aria-pressed={isSelected}
        align="center"
        justify="space-between"
        gap={3}
        px={3}
        h={ROW_HEIGHT}
        borderWidth="2px"
        // Dashed as well as red, so a wrong match does not rely on colour.
        borderStyle={isWrong ? 'dashed' : 'solid'}
        borderColor={
          isCorrect
            ? 'green.500'
            : isWrong
            ? 'red.500'
            : isSelected
            ? 'teal.500'
            : 'border.subtle'
        }
        borderRadius="md"
        bg={
          isCorrect
            ? 'surface.correct'
            : isWrong
            ? 'surface.wrong'
            : isSelected
            ? 'accent.subtle'
            : 'surface.slot'
        }
        onClick={() => pickSymbol(group, pair)}
      >
        <Text
          fontFamily="ipa"
          className="ipa-text"
          fontSize="xl"
          fontWeight="bold"
        >
          [{pair.symbol}]
        </Text>
        <Text fontSize="md" color={placed ? 'inherit' : 'text.muted'}>
          {placed || '—'}
        </Text>
      </Flex>
    )
  }

  const renderWordCell = (group: FrameGroup, word: string) => {
    const used = group.pairs.some((p) => answers[p.questionId] === word)
    const isSelected =
      selection?.kind === 'word' &&
      selection.word === word &&
      selection.frame === group.frame
    return (
      <Button
        h={ROW_HEIGHT}
        w="full"
        variant={isSelected ? 'solid' : 'outline'}
        colorScheme={isSelected ? 'teal' : 'gray'}
        aria-label={`Word ${word}${used ? ', already matched' : ''}`}
        aria-pressed={isSelected}
        opacity={used ? 0.4 : 1}
        isDisabled={isCompleted}
        onClick={() => pickWord(group, word)}
      >
        {word}
      </Button>
    )
  }

  return (
    <VStack spacing={5} align="stretch">
      <Box
        bg="surface.subtle"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="border.subtle"
      >
        <Text fontSize="sm" color="text.primary">
          <Text as="span" fontWeight="bold">
            Instructions:
          </Text>{' '}
          {quizData.instructions?.trim() ||
            'Match the IPA symbol with the associated word. Click a symbol then its word, or a word then its symbol — either order works. Click a matched pair again to undo it.'}
        </Text>
      </Box>

      {shuffled.map((group) => (
        <Box
          key={group.frame}
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="lg"
          p={4}
        >
          <Text
            fontFamily="ipa"
            className="ipa-text"
            fontSize="2xl"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            {group.frame}
          </Text>

          {/* One grid, two columns, one row per pair — so each word on the
              right lines up with a symbol row on the left. */}
          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            columnGap={5}
            rowGap={2}
            alignItems="stretch"
          >
            {group.pairs.map((pair, i) => (
              <React.Fragment key={pair.questionId}>
                {renderSymbolRow(group, pair)}
                {renderWordCell(group, group.words[i])}
              </React.Fragment>
            ))}
          </Grid>
        </Box>
      ))}

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={() => {}}
        onFinish={handleFinish}
        isNextDisabled={!allCorrect || isLoading}
        isCompleted={isCompleted}
      />
    </VStack>
  )
}

export default MatchingExercise
