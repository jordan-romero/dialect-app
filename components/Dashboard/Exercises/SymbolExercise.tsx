import React, { useState, useEffect } from 'react'
import { Box, Text, Grid, GridItem, Button, Flex } from '@chakra-ui/react'
import { MdVolumeUp } from 'react-icons/md'
import useQuiz from './utils'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface SymbolExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const AudioButton: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
  const [audio] = useState(new Audio(audioUrl))

  const playAudio = () => {
    audio.play()
  }

  return (
    <Button onClick={playAudio} size="sm" leftIcon={<MdVolumeUp />}>
      Play Audio
    </Button>
  )
}

const SymbolExercise: React.FC<SymbolExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [shuffledAnswerOptions, setShuffledAnswerOptions] = useState<any[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<any[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    if (quizData?.questions) {
      setShuffledAnswerOptions(shuffleArray(flattenOptions(quizData)))
    }
  }, [quizData?.questions])

  // Restore saved progress: if this quiz was completed, show every word as
  // answered (locked) until the learner clicks "Try again".
  useEffect(() => {
    const loadProgress = async () => {
      if (!quizData) return
      try {
        const res = await fetch(
          `/api/userQuizProgress?quizId=${quizData.id}&lessonId=${lessonId}`,
        )
        if (!res.ok) return
        const data = await res.json()
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
          setCompletedWords(all)
          setCurrentWordIndex(all.length)
        }
      } catch (e) {
        console.error('Error loading symbol quiz progress:', e)
      }
    }
    loadProgress()
  }, [quizData, lessonId])

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

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(selectedSymbol === symbol ? null : symbol)
  }

  const handleAnswerClick = (answerId: number, correctSymbol: string) => {
    // Once completed, answers are locked until "Try again".
    if (isCompleted) return
    if (selectedSymbol) {
      const isCorrect = selectedSymbol === correctSymbol
      if (isCorrect) {
        // Add current word to completed words
        setCompletedWords((prev) => [
          ...prev,
          shuffledAnswerOptions[currentWordIndex],
        ])
        // Move to next word
        setCurrentWordIndex((prev) => prev + 1)
      }
      setAnswers((prev) => ({
        ...prev,
        [answerId]: selectedSymbol,
      }))
      setSelectedSymbol(null)
    }
  }

  const underlineWord = (word: string, rhymeCategories: string | string[]) => {
    if (!rhymeCategories) {
      return (
        <Text as="span" fontFamily="'Charis SIL', serif">
          {word}
        </Text>
      )
    }

    // Parse the rhymeCategories if it's a string
    const categories =
      typeof rhymeCategories === 'string'
        ? JSON.parse(rhymeCategories)
        : rhymeCategories

    let result = word.split('')
    const underlineIndices = new Set<number>()

    categories.forEach((category: string) => {
      switch (category) {
        case 'First':
          underlineIndices.add(0)
          break
        case 'First Two':
          underlineIndices.add(0)
          underlineIndices.add(1)
          break
        case 'Last':
          underlineIndices.add(word.length - 1)
          break
        case 'Last Two':
          underlineIndices.add(word.length - 2)
          underlineIndices.add(word.length - 1)
          break
        case 'Last Three':
          underlineIndices.add(word.length - 3)
          underlineIndices.add(word.length - 2)
          underlineIndices.add(word.length - 1)
          break
        case 'Second To Last':
          underlineIndices.add(word.length - 2)
          break
      }
    })

    return (
      <Text as="span" fontFamily="'Charis SIL', serif">
        {result.map((char, index) =>
          underlineIndices.has(index) ? (
            <Text as="u" display="inline" key={index}>
              {char}
            </Text>
          ) : (
            <Text as="span" display="inline" key={index}>
              {char}
            </Text>
          ),
        )}
      </Text>
    )
  }
  const isAnswerCorrect = (answerId: number, correctSymbol: string) => {
    return answers[answerId] === correctSymbol
  }

  const getBackgroundColor = (answerId: number, correctSymbol: string) => {
    if (!answers[answerId]) return 'white'
    return isAnswerCorrect(answerId, correctSymbol) ? 'green.100' : 'red.100'
  }

  const areAllAnswered = () => {
    return currentWordIndex >= shuffledAnswerOptions.length
  }

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

  if (!quizData) return <QuizSkeleton />

  return (
    <Box>
      <Box
        position="sticky"
        top="0"
        bg="white"
        zIndex="1"
        py={4}
        borderColor="gray.200"
      >
        <Text fontStyle="italic" mb={4}>
          Select the IPA consonant symbol that corresponds with the underlined
          part of the word when spoken in a General American dialect.
        </Text>
      </Box>

      {/* Symbol Bank */}
      <Box mb={8}>
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

      {/* Current Word */}
      <Box mb={8}>
        {currentWordIndex < shuffledAnswerOptions.length && (
          <Box
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            backgroundColor={
              answers[shuffledAnswerOptions[currentWordIndex].id]
                ? getBackgroundColor(
                    shuffledAnswerOptions[currentWordIndex].id,
                    shuffledAnswerOptions[currentWordIndex].correctSymbol,
                  )
                : 'white'
            }
            onClick={() =>
              handleAnswerClick(
                shuffledAnswerOptions[currentWordIndex].id,
                shuffledAnswerOptions[currentWordIndex].correctSymbol,
              )
            }
            cursor="pointer"
            _hover={{ borderColor: 'gray.300' }}
          >
            <Flex alignItems="center" justify="space-between">
              <Flex alignItems="center" gap={2}>
                <Box>
                  {underlineWord(
                    shuffledAnswerOptions[currentWordIndex].optionText,
                    shuffledAnswerOptions[currentWordIndex].rhymeCategory,
                  )}
                </Box>
                {shuffledAnswerOptions[currentWordIndex].audioUrl && (
                  <AudioButton
                    audioUrl={shuffledAnswerOptions[currentWordIndex].audioUrl}
                  />
                )}
              </Flex>
              {answers[shuffledAnswerOptions[currentWordIndex].id] && (
                <Text
                  fontFamily="'Charis SIL', serif"
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {answers[shuffledAnswerOptions[currentWordIndex].id]}
                </Text>
              )}
            </Flex>
          </Box>
        )}
      </Box>

      {/* Completed Words */}
      <Box mb={8}>
        <Text fontWeight="bold" mb={2}>
          Completed Words:
        </Text>
        <Flex flexWrap="wrap" gap={2}>
          {completedWords.map((word, index) => (
            <Box
              key={index}
              borderWidth={1}
              borderColor="gray.200"
              borderRadius="md"
              p={2}
              backgroundColor="green.100"
            >
              <Flex alignItems="center" gap={2}>
                <Text>{word.optionText}</Text>
                <Text fontFamily="'Charis SIL', serif">
                  ({word.correctSymbol})
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={handleFinish}
        onFinish={handleFinish}
        isNextDisabled={!areAllAnswered() || isLoading}
        isCompleted={isCompleted}
      />
    </Box>
  )
}

export default SymbolExercise
