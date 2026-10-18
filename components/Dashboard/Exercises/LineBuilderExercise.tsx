import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from '@chakra-ui/react'
import useQuiz from './utils'
import { AnswerOption, Question } from './QuizTypes'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { shuffleArray } from './shuffle'
import { postQuizAnswers, fetchQuizProgress } from './quizApi'

// CP2 C - Hamlet's Advice pt. 2. One question per word, three transcriptions
// each, but the learner should feel they're transcribing a sentence: per the
// doc, "each word populates in the final sentence as they find the correct
// answer". Words are grouped into sentences by categories[0] and shown in id
// order as a line across the top; the current word's choices sit beneath it,
// and a correct pick drops its transcription into the line and moves on.
//
// Answers are saved like multiple choice ({questionId: optionId}) so earlier
// progress on this quiz still restores.

// A correct pick stays on screen, green, before the line fills in and the next
// word's choices replace it, so the advance doesn't jump under the learner.
const ADVANCE_DELAY_MS = 1000

interface LineBuilderProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const LineBuilderExercise: React.FC<LineBuilderProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const quiz = useMemo(
    () => quizzes?.find((q) => q.order === quizIndex),
    [quizzes, quizIndex],
  )
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [misses, setMisses] = useState<Record<number, number[]>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [heldOptionId, setHeldOptionId] = useState<number | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Don't let a pending advance fire after unmount / "Try again".
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    },
    [],
  )
  const toast = useToast()

  const sentences = useMemo(() => {
    const groups = new Map<string, Question[]>()
    ;[...(quiz?.questions ?? [])]
      .sort((a, b) => a.id - b.id)
      .forEach((q) => {
        const key = q.categories?.[0] ?? '1'
        groups.set(key, [...(groups.get(key) ?? []), q])
      })
    return Array.from(groups.values())
  }, [quiz])

  const optionsSignature = (quiz?.questions ?? [])
    .map((q) => q.answerOptions.map((o) => o.id).join(','))
    .join('|')
  const shuffledByQuestion = useMemo(() => {
    const out: Record<number, AnswerOption[]> = {}
    ;(quiz?.questions ?? []).forEach((q) => {
      out[q.id] = shuffleArray(q.answerOptions)
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsSignature])

  useEffect(() => {
    if (!quiz) return
    fetchQuizProgress(quiz.id, lessonId)
      .then((data) => {
        if (!data) return
        setIsCompleted(data.isCompleted)
        const restored: Record<number, number> = {}
        data.answers.forEach((a) => {
          const id = parseInt(a.textAnswer)
          if (!Number.isNaN(id)) restored[a.questionId] = id
        })
        // Saved answers fill in around this session's, never over them.
        setPicked((prev) => ({ ...restored, ...prev }))
      })
      .catch((error) => console.error('Error loading quiz progress:', error))
    // Keyed on the id: the quiz object is rebuilt on every quizzes refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id, lessonId])

  if (!quiz || sentences.length === 0) return <QuizSkeleton />

  const words = sentences[sentenceIndex] ?? []
  const correctOf = (q: Question) => q.answerOptions.find((o) => o.isCorrect)
  const isWordDone = (q: Question) => picked[q.id] === correctOf(q)?.id
  const current = isCompleted ? undefined : words.find((q) => !isWordDone(q))
  const isSentenceDone = isCompleted || !current
  const plain = (q: Question) => q.text.replace(/[“”]/g, '')

  const choose = (q: Question, option: AnswerOption) => {
    if (heldOptionId !== null) return
    if (option.isCorrect) {
      setHeldOptionId(option.id)
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null
        setPicked((prev) => ({ ...prev, [q.id]: option.id }))
        setHeldOptionId(null)
      }, ADVANCE_DELAY_MS)
    } else {
      setMisses((prev) => ({
        ...prev,
        [q.id]: [...(prev[q.id] ?? []), option.id],
      }))
    }
  }

  const submitQuiz = async () => {
    setIsLoading(true)
    try {
      const ok = await postQuizAnswers({
        quizId: quiz.id,
        lessonId,
        answers: Object.entries(picked).map(([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          textAnswer: String(optionId),
        })),
      })
      if (ok) {
        setIsCompleted(true)
        onComplete()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save your answers. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (sentenceIndex === sentences.length - 1) {
      if (!isCompleted) await submitQuiz()
    } else {
      setSentenceIndex((i) => i + 1)
    }
  }

  return (
    <Box>
      {quiz.instructions && (
        <Text fontStyle="italic" mb={4}>
          Instructions: {quiz.instructions}
        </Text>
      )}

      {/* The line itself: English until a word is solved, then its IPA. */}
      <Box
        bg="accent.subtle"
        borderLeft="4px solid"
        borderColor="brand.iris"
        borderRadius="md"
        px={{ base: 3, md: 5 }}
        py={4}
      >
        <Wrap spacingX={3} spacingY={3} align="flex-end">
          {words.map((q) => {
            const done = isCompleted || isWordDone(q)
            const isCurrent = q.id === current?.id
            return (
              <WrapItem key={q.id}>
                <Flex direction="column" align="center" minW="2.5rem">
                  <Text
                    className={done ? 'ipa-text' : undefined}
                    fontSize="xl"
                    fontWeight="bold"
                    lineHeight="short"
                    color={
                      done
                        ? 'purple.900'
                        : isCurrent
                        ? 'brand.iris'
                        : 'gray.400'
                    }
                    borderBottom="3px solid"
                    borderColor={isCurrent ? 'brand.iris' : 'transparent'}
                    px={1}
                  >
                    {done ? correctOf(q)?.optionText : plain(q)}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="text.muted"
                    visibility={done ? 'visible' : 'hidden'}
                  >
                    {plain(q)}
                  </Text>
                </Flex>
              </WrapItem>
            )
          })}
        </Wrap>
      </Box>

      {current && (
        <Box mt={6}>
          <Text mb={3}>
            Transcribe{' '}
            <Text as="span" fontWeight="bold" color="brand.iris">
              {plain(current)}
            </Text>
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
            {(shuffledByQuestion[current.id] ?? []).map((option) => {
              const missed = misses[current.id]?.includes(option.id)
              const held = heldOptionId === option.id
              return (
                <Button
                  key={option.id}
                  className="ipa-text"
                  fontSize="xl"
                  size="lg"
                  variant={held ? 'solid' : missed ? 'outline' : 'brandWhite'}
                  colorScheme={held ? 'green' : missed ? 'red' : undefined}
                  isDisabled={missed}
                  onClick={() => choose(current, option)}
                >
                  {option.optionText}
                </Button>
              )
            })}
          </SimpleGrid>
          {heldOptionId !== null ? (
            <Text mt={2} color="green.600" fontWeight="bold">
              Correct!
            </Text>
          ) : misses[current.id]?.length ? (
            <Text mt={2} color="red.600" fontWeight="bold">
              Not quite – try another.
            </Text>
          ) : null}
        </Box>
      )}

      {isSentenceDone && !isCompleted && (
        <Text mt={6} fontWeight="bold" color="green.600">
          Line complete!
        </Text>
      )}

      <QuizNavigation
        currentQuestion={sentenceIndex + 1}
        totalQuestions={sentences.length}
        onPrevious={() => setSentenceIndex((i) => Math.max(0, i - 1))}
        onNext={handleNext}
        onFinish={handleNext}
        isNextDisabled={!isSentenceDone || isLoading}
        isCompleted={isCompleted}
        disabledReason={
          isSentenceDone ? undefined : 'Transcribe every word in the line'
        }
      />
    </Box>
  )
}

export default LineBuilderExercise
