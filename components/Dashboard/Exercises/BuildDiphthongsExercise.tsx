import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Button, Flex, Icon, Text, Progress } from '@chakra-ui/react'
import { MdCheckCircle, MdPlayArrow } from 'react-icons/md'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import VowelChart from './VowelChart'
import InstructionsBox from './InstructionsBox'
import { renderUnderlined } from './UnderlineMarkup'

interface BuildDiphthongsExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

type Question = {
  symbol: string
  parts: string[]
  /** Lexical set word, e.g. "PR{I}CE" ({…} = the underlined part). */
  example?: string
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

// Which boxes carry a breve (the non-syllabic, gliding part), read from the
// sound's written symbol: a box gets one when its letter is followed by a
// combining breve. aɪ̆ → box 2, ɪ̆u → box 1, aɪ̆ə̆ → boxes 2 and 3,
// ɪ̆ʊɚ̆ → boxes 1 and 3.
const BREVE = '\u0306'
const breveSlots = (symbol: string): number[] => {
  const slots: number[] = []
  let box = -1
  for (const ch of Array.from(symbol)) {
    if (/\p{M}/u.test(ch)) {
      if (ch === BREVE && box >= 0) slots.push(box)
    } else box++
  }
  return slots
}

const BuildDiphthongsExercise: React.FC<BuildDiphthongsExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const [data, setData] = useState<QuizData | null>(null)
  const [index, setIndex] = useState(0)
  /** The symbol in each box of the current sound (null = empty). */
  const [placed, setPlaced] = useState<(string | null)[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const question = data?.items[index]

  // One clip at a time: starting a sound stops whatever is still playing.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playTarget = useCallback(() => {
    if (!question?.audioUrl) return
    audioRef.current?.pause()
    const audio = new Audio(question.audioUrl)
    audioRef.current = audio
    audio.play().catch(() => {})
  }, [question])

  // No auto-play: the learner starts each sound with "Play sound" (the
  // instructions say so). Moving on stops anything still playing.
  useEffect(() => {
    audioRef.current?.pause()
  }, [index])

  // Leaving the exercise silences it.
  useEffect(() => () => audioRef.current?.pause(), [])

  // Works like the other click-to-place exercises: a vowel fills the next
  // empty box, and clicking a filled box empties it. The sound is judged once
  // every box is filled; a correct build stays up (and replays the sound)
  // until the learner moves on.
  const isSolved = feedback === 'correct'

  const handleSymbolClick = (symbol: string) => {
    if (!question || isCompleted || isSolved) return
    const next = Array.from(
      { length: question.parts.length },
      (_, i) => placed[i] ?? null,
    )
    const target = next.findIndex((s) => s === null)
    if (target === -1) return // every box is full
    next[target] = symbol
    setPlaced(next)

    if (next.some((s) => s === null)) {
      setFeedback(null)
      return
    }
    const correct = next.every((s, i) => s === question.parts[i])
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) playTarget()
  }

  const clearSlot = (i: number) => {
    if (isCompleted || isSolved || !placed[i]) return
    const next = [...placed]
    next[i] = null
    setPlaced(next)
    setFeedback(null)
  }

  const goToNextSound = () => {
    setPlaced([])
    setFeedback(null)
    setIndex((i) => i + 1)
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
  const breves = question ? breveSlots(question.symbol) : []

  return (
    <Box>
      <InstructionsBox text={data.instructions} mb={4} />

      <Flex align="center" gap={3} mb={4}>
        <Progress
          value={total ? (Math.min(index + 1, total) / total) * 100 : 0}
          size="sm"
          borderRadius="full"
          colorScheme="green"
          flex="1"
        />
        <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
          {Math.min(index + 1, total)} / {total}
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
              leftIcon={<MdPlayArrow />}
              size="sm"
              flexShrink={0}
            >
              Play sound
            </Button>

            <Flex gap={2} align="flex-end">
              {Array.from({ length: slotCount }).map((_, i) => (
                <Flex key={i} direction="column" align="center">
                  {/* The breve sits above its box (empty space keeps the
                    boxes aligned when a box has none). */}
                  <Text
                    fontFamily="ipa"
                    className="ipa-text"
                    fontSize="2xl"
                    lineHeight="1"
                    h="20px"
                    color="text.primary"
                    aria-hidden
                  >
                    {breves.includes(i) ? '˘' : ''}
                  </Text>
                  <Flex
                    as="button"
                    type="button"
                    role="group"
                    position="relative"
                    onClick={() => clearSlot(i)}
                    aria-label={
                      placed[i]
                        ? `Box ${i + 1}: ${placed[i]}. Click to remove`
                        : `Box ${i + 1}, empty`
                    }
                    cursor={placed[i] && !isSolved ? 'pointer' : 'default'}
                    align="center"
                    justify="center"
                    minW="52px"
                    h="52px"
                    borderWidth={2}
                    borderStyle={placed[i] ? 'solid' : 'dashed'}
                    // Blue while building; green only once the whole sound is
                    // right; a wrong build outlines just the wrong symbols red.
                    borderColor={
                      !placed[i]
                        ? 'gray.300'
                        : isSolved
                        ? 'green.400'
                        : feedback === 'wrong' &&
                          placed[i] !== question?.parts[i]
                        ? 'red.400'
                        : 'blue.400'
                    }
                    borderRadius="md"
                    bg={placed[i] ? 'surface.slot' : 'surface.subtle'}
                    transition="border-color 0.15s ease, background-color 0.15s ease"
                    _hover={
                      placed[i] && !isSolved
                        ? { borderColor: 'red.300', bg: 'red.50' }
                        : undefined
                    }
                    fontFamily="ipa"
                    className="ipa-text"
                    fontSize="2xl"
                  >
                    {placed[i] ?? ''}
                    {/* A small × on hover says the box can be emptied. */}
                    {placed[i] && !isSolved && (
                      <Flex
                        position="absolute"
                        top="-8px"
                        right="-8px"
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        bg="red.400"
                        color="white"
                        fontSize="xs"
                        fontFamily="body"
                        align="center"
                        justify="center"
                        opacity={0}
                        transition="opacity 0.15s ease"
                        _groupHover={{ opacity: 1 }}
                        _groupFocusVisible={{ opacity: 1 }}
                        aria-hidden
                      >
                        ×
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Flex>

            {question?.example && (
              <Text
                fontSize="lg"
                color="text.muted"
                alignSelf="flex-end"
                pb={3}
              >
                as in{' '}
                <Text as="span" fontWeight="bold" color="text.primary">
                  {renderUnderlined(question.example)}
                </Text>
              </Text>
            )}

            {feedback === 'wrong' && (
              <Text fontSize="sm" color="red.600" fontStyle="italic">
                Not quite — click a red box to clear it, then pick the right
                vowel.
              </Text>
            )}

            {/* A correct build stays up until the learner moves on. */}
            {isSolved && (
              <Flex align="center" gap={3} ml={{ md: 'auto' }} wrap="wrap">
                <Flex
                  align="center"
                  gap={2}
                  bg="green.500"
                  color="white"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  fontWeight="bold"
                >
                  <Icon as={MdCheckCircle} boxSize={5} />
                  Correct!
                </Flex>
                <Button variant="brandBold" onClick={goToNextSound}>
                  {index === total - 1 ? 'Finish' : 'Next sound'}
                </Button>
              </Flex>
            )}
          </Flex>

          {/* The chart swaps its central pair for r-coloured forms when the
              sound being built is rhotic, exactly as the two design charts do. */}
          <VowelChart
            rhotic={!!question?.rhotic}
            onSymbolClick={handleSymbolClick}
            audioFor={(s) => data.chartAudio[s]}
            usedSymbols={placed.filter((s): s is string => s !== null)}
            disabled={isCompleted || isSolved}
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
