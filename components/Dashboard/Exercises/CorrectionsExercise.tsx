import React, { useState, useEffect, useMemo } from 'react'
import { Box, Button, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'

interface Word {
  ipa: string
  wrong: boolean
}
interface Option {
  text: string
  correct: boolean
}
interface Item {
  sentence: string
  words: Word[]
  prompt: string
  options: Option[]
}
interface CorrectionsData {
  id: number
  lessonId: number
  quizType: string
  questions: Array<{ id: number; text: string }>
  items: Item[]
}

interface Props {
  lessonId: number
  quizIndex: number
  onComplete: () => void
  onAllCorrectChange?: (allCorrect: boolean) => void
}

export const CorrectionsExercise: React.FC<Props> = ({
  lessonId,
  onComplete,
  onAllCorrectChange,
}) => {
  const [data, setData] = useState<CorrectionsData | null>(null)
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState<1 | 2>(1)
  const [wrongPick, setWrongPick] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/correctionsData.json')
      .then((r) => r.json())
      .then((d: CorrectionsData) => setData(d))
      .catch((e) => console.error('Error loading corrections:', e))
  }, [])

  const item = data?.items[index]

  // Rotate step-2 options so the correct one isn't always first.
  const options = useMemo(() => {
    if (!item) return []
    const k = index % item.options.length
    return item.options.slice(k).concat(item.options.slice(0, k))
  }, [item, index])

  const allDone = !!data && completed.size === data.items.length

  useEffect(() => {
    onAllCorrectChange?.(allDone)
  }, [allDone, onAllCorrectChange])

  const pickWord = (w: Word) => {
    if (w.wrong) {
      setWrongPick(null)
      setStep(2)
    } else {
      setWrongPick(w.ipa)
    }
  }

  const pickOption = (o: Option) => {
    if (!o.correct) {
      setWrongPick(o.text)
      return
    }
    setWrongPick(null)
    const next = new Set(completed)
    next.add(index)
    setCompleted(next)
    if (index + 1 < (data?.items.length ?? 0)) {
      setIndex(index + 1)
      setStep(1)
    }
  }

  const handleFinish = async () => {
    if (!data) return
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
      if (res.ok) setIsCompleted(true)
    } catch (e) {
      console.error('Error submitting corrections:', e)
    } finally {
      setIsLoading(false)
    }
    onComplete()
  }

  if (!data) return <QuizSkeleton />
  if (!item) return <Text>No correction items.</Text>

  return (
    <VStack spacing={5} align="stretch">
      <Text fontSize="sm" color="gray.600">
        Sentence {index + 1} of {data.items.length}
        {completed.size > 0 && ` · ${completed.size} fixed`}
      </Text>

      <Box
        bg="gray.50"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm">
          <b>Instructions:</b>{' '}
          {step === 1
            ? 'One word in the sentence is transcribed incorrectly. Click the wrong one.'
            : 'Now choose the correct transcription of that word.'}
        </Text>
      </Box>

      <Text fontSize="md" fontStyle="italic" color="gray.700">
        “{item.sentence}”
      </Text>

      {step === 1 ? (
        <Wrap spacing={2}>
          {item.words.map((w, i) => (
            <WrapItem key={i}>
              <Button
                fontFamily="'Charis SIL', serif"
                fontSize="lg"
                variant="outline"
                colorScheme={wrongPick === w.ipa ? 'red' : 'gray'}
                onClick={() => pickWord(w)}
              >
                {w.ipa}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <VStack align="stretch" spacing={2} maxW="360px">
          {options.map((o, i) => (
            <Button
              key={i}
              fontFamily="'Charis SIL', serif"
              fontSize="lg"
              variant="outline"
              colorScheme={wrongPick === o.text ? 'red' : 'gray'}
              onClick={() => pickOption(o)}
            >
              {o.text}
            </Button>
          ))}
        </VStack>
      )}

      {wrongPick && (
        <Text color="red.500" fontSize="sm">
          Not quite — try again.
        </Text>
      )}

      <QuizNavigation
        currentQuestion={index + 1}
        totalQuestions={data.items.length}
        onPrevious={() => {}}
        onNext={() => {}}
        onFinish={handleFinish}
        isNextDisabled={!allDone || isLoading || isCompleted}
      />
    </VStack>
  )
}

export default CorrectionsExercise
