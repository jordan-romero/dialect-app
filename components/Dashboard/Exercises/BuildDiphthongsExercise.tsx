import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Button, Flex, Text, Progress } from '@chakra-ui/react'
import { MdVolumeUp, MdBackspace } from 'react-icons/md'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import VowelChart from './VowelChart'

interface BuildDiphthongsExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

type Question = {
  symbol: string
  parts: string[]
  rhotic: boolean
  audioUrl: string
}

type QuizData = {
  id: number
  lessonId: number
  quizType: string
  title: string
  instructions: string
  questions: { id: number; text: string }[]
  items: Question[]
  chartAudio: Record<string, string>
}

/** How long a completed build stays green before the next sound loads. */
const FLASH_MS = 700

const BuildDiphthongsExercise: React.FC<BuildDiphthongsExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const [data, setData] = useState<QuizData | null>(null)
  const [index, setIndex] = useState(0)
  /** Symbols placed so far for the current sound, in click order. */
  const [placed, setPlaced] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/buildDiphthongs')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => !cancelled && setData(d))
      .catch((e) => console.error('Error loading build-diphthongs data:', e))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    },
    [],
  )

  const question = data?.items[index]

  const playTarget = useCallback(() => {
    if (question?.audioUrl) new Audio(question.audioUrl).play().catch(() => {})
  }, [question])

  // Play each new sound as it comes up — the clip is the prompt, so waiting for
  // a click would leave the learner looking at empty slots with no question.
  useEffect(() => {
    if (question) playTarget()
  }, [question, playTarget])

  const handleSymbolClick = (symbol: string) => {
    if (!question || isCompleted || advanceTimer.current) return
    if (placed.length >= question.parts.length) return

    const next = [...placed, symbol]
    setPlaced(next)

    // Judge only once the build is the right length — a wrong first symbol
    // shouldn't be marked until the learner has actually finished.
    if (next.length < question.parts.length) {
      setFeedback(null)
      return
    }
    const correct = next.every((s, i) => s === question.parts[i])
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null
        setPlaced([])
        setFeedback(null)
        setIndex((i) => i + 1)
      }, FLASH_MS)
    }
  }

  const clearLast = () => {
    if (advanceTimer.current) return
    setPlaced((p) => p.slice(0, -1))
    setFeedback(null)
  }

  const total = data?.items.length ?? 0
  const allDone = index >= total

  const submitQuiz = async (): Promise<boolean> => {
    if (!data) return false
    setIsLoading(true)
    try {
      const res = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: data.id,
          lessonId,
          answers: data.questions.map((q) => ({
            questionId: q.id,
            textAnswer: 'completed',
          })),
        }),
      })
      if (res.ok) {
        setIsCompleted(true)
        return true
      }
      return false
    } catch (e) {
      console.error('Error submitting build-diphthongs quiz:', e)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = async () => {
    // Only advance/unlock once the completion has actually saved, so a failed
    // request can't mark the quiz done in the parent's state.
    if (isCompleted || (await submitQuiz())) onComplete()
  }

  if (!data) return <QuizSkeleton />

  const slotCount = question?.parts.length ?? 0

  return (
    <Box>
      <Text fontStyle="italic" mb={4}>
        Instructions: {data.instructions}
      </Text>

      <Flex align="center" gap={3} mb={4}>
        <Progress
          value={total ? (index / total) * 100 : 0}
          size="sm"
          borderRadius="full"
          colorScheme="green"
          flex="1"
        />
        <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
          {Math.min(index, total)} / {total}
        </Text>
      </Flex>

      {allDone ? (
        <Box
          borderWidth={1}
          borderColor="green.200"
          bg="green.50"
          borderRadius="lg"
          p={6}
          textAlign="center"
          mb={4}
        >
          <Text fontWeight="semibold">
            All {total} sounds built. Nice work.
          </Text>
        </Box>
      ) : (
        <>
          {/* Prompt: the clip, and the slots it has to be built into. */}
          <Flex
            align="center"
            gap={4}
            wrap="wrap"
            mb={5}
            p={4}
            borderWidth={2}
            borderRadius="lg"
            borderColor={
              feedback === 'correct'
                ? 'green.400'
                : feedback === 'wrong'
                ? 'red.400'
                : 'gray.200'
            }
            bg={
              feedback === 'correct'
                ? 'green.50'
                : feedback === 'wrong'
                ? 'red.50'
                : 'white'
            }
            transition="background-color 0.15s ease, border-color 0.15s ease"
          >
            <Button
              onClick={playTarget}
              leftIcon={<MdVolumeUp />}
              size="sm"
              flexShrink={0}
            >
              Play sound
            </Button>

            <Flex gap={2} align="center">
              {Array.from({ length: slotCount }).map((_, i) => (
                <Flex
                  key={i}
                  align="center"
                  justify="center"
                  minW="52px"
                  h="52px"
                  borderWidth={2}
                  borderStyle={placed[i] ? 'solid' : 'dashed'}
                  borderColor={
                    feedback === 'wrong' && placed[i] !== question?.parts[i]
                      ? 'red.400'
                      : placed[i]
                      ? 'green.300'
                      : 'gray.300'
                  }
                  borderRadius="md"
                  bg={placed[i] ? 'white' : 'gray.50'}
                  fontFamily="ipa"
                  className="ipa-text"
                  fontSize="2xl"
                >
                  {placed[i] ?? ''}
                </Flex>
              ))}
            </Flex>

            {placed.length > 0 && feedback !== 'correct' && (
              <Button
                onClick={clearLast}
                leftIcon={<MdBackspace />}
                size="sm"
                variant="ghost"
              >
                Undo
              </Button>
            )}

            {feedback === 'wrong' && (
              <Text fontSize="sm" color="red.600" fontStyle="italic">
                Not quite — undo and try the order again.
              </Text>
            )}
          </Flex>

          {/* The chart swaps its central pair for r-coloured forms when the
              sound being built is rhotic, exactly as the two design charts do. */}
          <VowelChart
            rhotic={!!question?.rhotic}
            onSymbolClick={handleSymbolClick}
            audioFor={(s) => data.chartAudio[s]}
            usedSymbols={placed}
            disabled={isCompleted || feedback === 'correct'}
          />
        </>
      )}

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={handleFinish}
        onFinish={handleFinish}
        isNextDisabled={!allDone || isLoading}
        isCompleted={isCompleted}
        disabledReason={`Build all ${total} sounds to finish (${Math.min(
          index,
          total,
        )} done).`}
      />
    </Box>
  )
}

export default BuildDiphthongsExercise
