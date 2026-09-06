import React, { useState, useEffect, useRef } from 'react'
import { renderUnderlined } from './UnderlineMarkup'
import { Box, Text, Grid, Flex, Progress } from '@chakra-ui/react'
import useQuiz from './utils'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface SymbolExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

/** How long a correct answer stays green before the next word becomes active.
 *  Short enough to read as a flash rather than a wait — the previous three
 *  seconds made a 56-word exercise feel like it had stalled. */
const FLASH_MS = 550

const SymbolExercise: React.FC<SymbolExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [shuffledAnswerOptions, setShuffledAnswerOptions] = useState<any[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  /** null = awaiting an answer; set once the learner picks a symbol. */
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  /** Saved progress has resolved — until then we render nothing, or the first
   *  word flashes before restore jumps the index to where the learner was. */
  const [progressLoaded, setProgressLoaded] = useState(false)
  /** Quiz the current word order was shuffled for, so it's shuffled once and
   *  never re-rolled mid-exercise by an incidental re-render. */
  const shuffledForQuizId = useRef<number | null>(null)

  // Match by `order` (not array index) so it stays correct if quiz ordering changes.
  const quizData = quizzes.find((q) => q.order === quizIndex)

  // All options across every question, each tagged with its correct symbol.
  const flattenOptions = (qd: typeof quizData) =>
    qd?.questions.flatMap((q) =>
      q.answerOptions.map((opt) => ({
        ...opt,
        correctSymbol: q.text, // The IPA symbol this option should match with
      })),
    ) ?? []

  useEffect(() => {
    if (!quizData?.id) return
    // `quizData` is recomputed by .find() on every render, so keying off the
    // object (or its questions array) re-ran this and reshuffled the deck
    // underneath the learner — the word would visibly flip.
    if (shuffledForQuizId.current === quizData.id) return
    shuffledForQuizId.current = quizData.id
    setShuffledAnswerOptions(shuffleArray(flattenOptions(quizData)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData?.id])

  // Restore saved progress: if this quiz was completed, show every word as
  // answered (locked) until the learner clicks "Try again".
  useEffect(() => {
    let cancelled = false
    const loadProgress = async () => {
      if (!quizData?.id) return
      try {
        const res = await fetch(
          `/api/userQuizProgress?quizId=${quizData.id}&lessonId=${lessonId}`,
        )
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return
        setIsCompleted(data.isCompleted)
        if (data.answers && data.answers.length > 0) {
          const saved = data.answers.find(
            (a: any) => a.questionId === quizData.questions[0]?.id,
          )
          let restoredAnswers: Record<string, string> = {}
          if (saved?.textAnswer && saved.textAnswer !== 'pending') {
            try {
              restoredAnswers = JSON.parse(saved.textAnswer)
            } catch {
              /* keep empty */
            }
          }
          const all = flattenOptions(quizData)
          // Fill in correct symbols for any answer we didn't store explicitly.
          const filled: Record<string, string> = { ...restoredAnswers }
          all.forEach((o) => {
            if (filled[o.id] === undefined) filled[o.id] = o.correctSymbol
          })
          setAnswers(filled)
          setCurrentWordIndex(all.length)
        }
      } catch (e) {
        if (!cancelled) console.error('Error loading symbol quiz progress:', e)
      } finally {
        if (!cancelled) setProgressLoaded(true)
      }
    }
    loadProgress()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData?.id, lessonId])

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffledArray = [...array]
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ]
    }
    return shuffledArray
  }

  const getSymbolBank = () => {
    if (!quizData?.questions) return []
    // Get unique IPA symbols from questions
    return Array.from(new Set(quizData.questions.map((q) => q.text)))
  }

  /**
   * Picking a symbol answers the current word outright. Correct answers flash
   * green and advance; wrong answers mark the blank red and stay put so the
   * learner can try again on the same word.
   */
  const handleSymbolSelect = (symbol: string) => {
    if (isCompleted) return
    // Ignore clicks during the post-correct flash.
    if (advanceTimer.current) return
    const current = shuffledAnswerOptions[currentWordIndex]
    if (!current) return

    setAnswers((prev) => ({ ...prev, [current.id]: symbol }))

    if (symbol === current.correctSymbol) {
      setFeedback('correct')
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null
        setCurrentWordIndex((prev) => prev + 1)
        setFeedback(null)
      }, FLASH_MS)
    } else {
      setFeedback('wrong')
    }
  }

  // Don't let a pending advance fire after unmount / "Try again".
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }, [])

  const total = shuffledAnswerOptions.length
  const areAllAnswered = () => currentWordIndex >= total

  const submitQuiz = async () => {
    if (!quizData) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quizData.id,
          lessonId,
          answers: quizData.questions.map((q) => ({
            questionId: q.id,
            // Store the full {answerId: symbol} map once on the first question.
            textAnswer:
              q.id === quizData.questions[0]?.id
                ? JSON.stringify(answers)
                : 'completed',
          })),
        }),
      })
      if (res.ok) setIsCompleted(true)
    } catch (e) {
      console.error('Error submitting symbol quiz:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!isCompleted) await submitQuiz()
    onComplete()
  }

  // Wait for the shuffled deck AND restored progress before painting a word,
  // otherwise word #1 shows for a frame and then jumps to the resume point.
  if (!quizData || !progressLoaded || shuffledAnswerOptions.length === 0)
    return <QuizSkeleton />

  const answeredCount = Math.min(currentWordIndex, total)

  /** One word in the grid: the word itself and the blank its symbol goes in.
   *  A plain render function rather than a nested component — a component
   *  declared here is a new type on every render, so React would unmount and
   *  remount all 56 cells each time, throwing away the flash transition. */
  const renderWordCell = (option: any, index: number) => {
    const isAnswered = index < currentWordIndex || isCompleted
    const isActive = !isCompleted && index === currentWordIndex
    const picked = answers[option.id]
    const showWrong = isActive && feedback === 'wrong'
    const showCorrect = isActive && feedback === 'correct'

    const borderColor = showCorrect
      ? 'green.500'
      : showWrong
      ? 'red.500'
      : isAnswered
      ? 'green.200'
      : isActive
      ? 'purple.400'
      : 'gray.200'

    return (
      <Flex
        key={option.id}
        align="center"
        justify="space-between"
        gap={3}
        px={4}
        py={3}
        borderWidth={isActive ? 2 : 1}
        borderColor={borderColor}
        borderRadius="lg"
        bg={
          showCorrect
            ? 'green.50'
            : showWrong
            ? 'red.50'
            : isAnswered
            ? 'green.50'
            : 'white'
        }
        opacity={!isAnswered && !isActive ? 0.45 : 1}
        transition="background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease"
        boxShadow={isActive ? 'sm' : 'none'}
      >
        <Box
          fontFamily="ipa"
          className="ipa-text"
          fontSize="lg"
          fontWeight={isActive ? 'semibold' : 'normal'}
        >
          {renderUnderlined(option.optionText)}
        </Box>

        {/* The blank. Filled once answered; outlined and empty until then. */}
        <Flex
          align="center"
          justify="center"
          minW="52px"
          h="40px"
          px={2}
          borderWidth={isAnswered ? 0 : 2}
          borderStyle="dashed"
          borderColor={showWrong ? 'red.300' : 'gray.300'}
          borderRadius="md"
          bg={isAnswered ? 'transparent' : 'gray.50'}
        >
          <Text
            fontFamily="ipa"
            className="ipa-text"
            fontSize="2xl"
            lineHeight="1"
            fontWeight="semibold"
            color={
              showWrong
                ? 'red.600'
                : isAnswered || showCorrect
                ? 'green.600'
                : 'gray.400'
            }
          >
            {isAnswered ? option.correctSymbol : picked ?? ''}
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Box>
      <Box position="sticky" top="0" bg="white" zIndex="1" pt={4} pb={3}>
        <Text fontStyle="italic" mb={3}>
          Select the IPA symbol that corresponds with the underlined part of the
          word when spoken in a General American dialect.
        </Text>

        {/* Symbol Bank */}
        <IPAKeyboard
          customSymbols={getSymbolBank()}
          autoDetectCategory={true}
          onSymbolClick={handleSymbolSelect}
          showTextArea={false}
          compact={true}
          hideInstructions={true}
          persistClickedSymbols={false}
          title="Symbol Bank"
        />
      </Box>

      {/* Progress — a 56-word exercise needs to show how far along it is. */}
      <Flex align="center" gap={3} mt={5} mb={3}>
        <Progress
          value={total ? (answeredCount / total) * 100 : 0}
          size="sm"
          borderRadius="full"
          colorScheme="green"
          flex="1"
        />
        <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
          {answeredCount} / {total}
        </Text>
      </Flex>

      {/* Two words per row, filled in order. */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
        {shuffledAnswerOptions.map((option, index) =>
          renderWordCell(option, index),
        )}
      </Grid>

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={handleFinish}
        onFinish={handleFinish}
        isNextDisabled={!areAllAnswered() || isLoading}
        isCompleted={isCompleted}
        disabledReason={`Answer all ${total} words to finish (${answeredCount} done).`}
      />
    </Box>
  )
}

export default SymbolExercise
