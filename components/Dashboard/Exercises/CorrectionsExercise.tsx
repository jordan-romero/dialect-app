import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface Word {
  ipa: string
  wrong: boolean
}
/**
 * One sentence, per the "e. EXERCISE - Corrections" doc. Part 1: find the
 * wrongly transcribed word. Part 2: that word splits into its symbols
 * (`segments`); the wrong one (`segments[wrongSegment]`) becomes the only
 * answer field, and the learner fills it with `correctSymbol` from the bank.
 * The other symbols are fixed, so nothing can be dropped in the wrong place.
 */
interface Item {
  sentence: string
  words: Word[]
  segments: string[]
  wrongSegment: number
  correctSymbol: string
}
interface CorrectionsData {
  id: number
  lessonId: number
  quizType: string
  questions: Array<{ id: number; text: string }>
  items: Item[]
  symbolBank: string[]
  symbolBankCategories: {
    consonants?: string[]
    monophthongs?: string[]
    diphthongs?: string[]
    triphthongs?: string[]
  }
}

interface Props {
  lessonId: number
  quizIndex: number
  onComplete: () => void
  onAllCorrectChange?: (allCorrect: boolean) => void
}

/** Matches Build-a-Word: hold on a fixed word before moving on. */
const ADVANCE_DELAY_MS = 3000

export const CorrectionsExercise: React.FC<Props> = ({
  lessonId,
  onComplete,
  onAllCorrectChange,
}) => {
  const [data, setData] = useState<CorrectionsData | null>(null)
  const [index, setIndex] = useState(0)
  const [part, setPart] = useState<1 | 2>(1)
  /** Part 1: the word clicked that is not the wrong one. */
  const [missedWord, setMissedWord] = useState<number | null>(null)
  /** Part 2: the last wrong symbol tried, shown in the blank until the next
   *  try. */
  const [miss, setMiss] = useState<string | null>(null)
  const [isFixed, setIsFixed] = useState(false)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/correctionsData.json')
      .then((r) => r.json())
      .then((d: CorrectionsData) => setData(d))
      .catch((e) => console.error('Error loading corrections:', e))
  }, [])

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    },
    [],
  )

  const item = data?.items[index]
  const allDone = !!data && completed.size === data.items.length

  useEffect(() => {
    onAllCorrectChange?.(allDone)
  }, [allDone, onAllCorrectChange])

  const pickWord = (w: Word, i: number) => {
    if (w.wrong) {
      setMissedWord(null)
      setPart(2)
    } else {
      setMissedWord(i)
    }
  }

  /** One answer field per word, so a bank click fills it directly. */
  const pickSymbol = (symbol: string) => {
    if (!item || !data || isFixed) return
    if (symbol !== item.correctSymbol) {
      setMiss(symbol)
      return
    }
    setMiss(null)
    setIsFixed(true)
    setCompleted((prev) => new Set(prev).add(index))
    if (index + 1 < data.items.length) {
      advanceTimer.current = setTimeout(() => {
        setIndex(index + 1)
        setPart(1)
        setIsFixed(false)
      }, ADVANCE_DELAY_MS)
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

  const wrongWord = item.words.find((w) => w.wrong)

  const renderSegment = (seg: string, i: number) => {
    const ipaText = (text: string) => (
      <Text
        fontFamily="ipa"
        className="ipa-text"
        fontSize="2xl"
        fontWeight="bold"
        color="text.primary"
      >
        {text}
      </Text>
    )
    // Symbols that are already right are fixed text, not targets.
    if (i !== item.wrongSegment) {
      return (
        <Flex key={i} minW="40px" h="64px" align="center" justify="center">
          {ipaText(seg)}
        </Flex>
      )
    }
    const shown = isFixed ? item.correctSymbol : miss
    return (
      <Flex
        key={i}
        role="status"
        aria-label={`Answer: ${
          isFixed
            ? `${item.correctSymbol}, correct`
            : miss
            ? `${miss}, not correct`
            : 'empty'
        }`}
        minW="64px"
        h="64px"
        px={3}
        align="center"
        justify="center"
        borderWidth="2px"
        // Dashed as well as red, so a miss does not rely on colour alone.
        borderStyle={miss ? 'dashed' : 'solid'}
        borderColor={isFixed ? 'green.500' : miss ? 'red.500' : 'brand.iris'}
        borderRadius="md"
        bg={
          isFixed ? 'surface.correct' : miss ? 'surface.wrong' : 'surface.slot'
        }
      >
        {shown ? (
          ipaText(shown)
        ) : (
          <Text color="text.muted" fontSize="xl">
            _
          </Text>
        )}
      </Flex>
    )
  }

  return (
    <VStack spacing={5} align="stretch">
      <Text fontSize="sm" color="text.muted">
        Sentence {index + 1} of {data.items.length}
        {completed.size > 0 && ` · ${completed.size} fixed`}
      </Text>

      <Box
        bg="surface.subtle"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="border.subtle"
      >
        <Text fontSize="sm" color="text.primary">
          <b>Instructions:</b>{' '}
          <Text as="span" fontWeight={part === 1 ? 'bold' : 'normal'}>
            First, identify the incorrectly transcribed word in the presented
            sentence.
          </Text>{' '}
          <Text as="span" fontWeight={part === 2 ? 'bold' : 'normal'}>
            Then, replace the mistake by clicking the correct symbol in the
            bank.
          </Text>
        </Text>
      </Box>

      <Text fontSize="md" fontStyle="italic" color="text.primary">
        “{item.sentence}”
      </Text>

      {part === 1 ? (
        <>
          <Wrap spacing={2}>
            {item.words.map((w, i) => (
              <WrapItem key={i}>
                <Button
                  fontFamily="ipa"
                  className="ipa-text"
                  fontSize="lg"
                  variant="outline"
                  colorScheme={missedWord === i ? 'red' : 'gray'}
                  onClick={() => pickWord(w, i)}
                >
                  {w.ipa}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
          {missedWord !== null && (
            <Text color="red.500" fontSize="sm">
              That word is transcribed correctly — try another.
            </Text>
          )}
        </>
      ) : (
        <>
          <VStack align="center" spacing={2}>
            <Text fontSize="sm" color="text.muted">
              Incorrect word:{' '}
              <Text as="span" fontFamily="ipa" className="ipa-text">
                {wrongWord?.ipa}
              </Text>
            </Text>
            <Flex gap={1} justify="center" wrap="wrap">
              {item.segments.map(renderSegment)}
            </Flex>
          </VStack>

          {isFixed ? (
            <Text
              color="green.600"
              fontSize="sm"
              fontWeight="bold"
              textAlign="center"
            >
              ✓ Correct!
              {index + 1 < data.items.length && ' Moving to the next sentence…'}
            </Text>
          ) : (
            miss && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                Not quite — try again.
              </Text>
            )
          )}

          {!isFixed && (
            <IPAKeyboard
              symbolBankCategories={data.symbolBankCategories}
              customSymbols={data.symbolBank}
              onSymbolClick={pickSymbol}
              showTextArea={false}
              compact={true}
              hideInstructions={true}
              persistClickedSymbols={false}
              showCategoriesInCompact={true}
              symbolSize="lg"
              maxW="100%"
            />
          )}
        </>
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
