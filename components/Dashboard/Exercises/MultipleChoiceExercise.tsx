/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useMemo } from 'react'
import { renderUnderlined } from './UnderlineMarkup'
import {
  Button,
  Box,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { MdAutoAwesome, MdVolumeUp } from 'react-icons/md'
import useQuiz from './utils'
import { AnswerOption } from './QuizTypes'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { shuffleArray } from './shuffle'

interface MultipleChoiceQuizProps {
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

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({})
  const [currentPart, setCurrentPart] = useState(1)
  const [shuffledPart1Questions, setShuffledPart1Questions] = useState<any[]>(
    [],
  )
  const [shuffledPart2Questions, setShuffledPart2Questions] = useState<any[]>(
    [],
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const quizData = useMemo(() => {
    console.log('🎲 Quiz Selection:', {
      foundQuizzes: quizzes?.length,
      targetIndex: quizIndex,
      quizzes: quizzes?.map((q) => ({
        id: q.id,
        order: q.order,
        type: q.quizType,
      })),
    })
    return quizzes?.find((quiz) => quiz.order === quizIndex)
  }, [quizzes, quizIndex])

  // Answer options are authored with the correct choice in a predictable slot,
  // so shuffle them per question. Memoised on the option ids so the order holds
  // steady while a learner works through a question and only re-rolls when a
  // different quiz actually loads.
  const optionsSignature = (quizData?.questions ?? [])
    .map(
      (question: any) =>
        `${question.id}:${(question.answerOptions ?? [])
          .map((option: AnswerOption) => option.id)
          .join(',')}`,
    )
    .join('|')

  const shuffledOptionsByQuestion = useMemo(() => {
    const byQuestion: Record<number, AnswerOption[]> = {}
    ;(quizData?.questions ?? []).forEach((question: any) => {
      byQuestion[question.id] = shuffleArray(question.answerOptions ?? [])
    })
    return byQuestion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsSignature])

  useEffect(() => {
    console.log('🎯 Questions Data:', {
      hasQuizData: !!quizData,
      questionsCount: quizData?.questions?.length,
      questions: quizData?.questions?.map((q) => ({
        id: q.id,
        text: q.text,
        answerOptionsCount: q.answerOptions?.length,
      })),
    })

    if (quizData?.questions) {
      const part1 = quizData.questions.filter(
        (question) => question.categories?.[0] !== undefined,
      )
      const part2 = quizData.questions.filter(
        (question) => question.categories?.[0] === undefined,
      )

      console.log('📝 Parts Debug:', {
        part1Count: part1.length,
        part2Count: part2.length,
        shuffledPart1: shuffledPart1Questions.length,
        shuffledPart2: shuffledPart2Questions.length,
      })

      setShuffledPart1Questions(part1)
      setShuffledPart2Questions(part2)
    }
  }, [quizData?.questions])

  // Log render state
  console.log('🎨 Render State:', {
    hasQuizzes: quizzes?.length > 0,
    hasQuizData: !!quizData,
    part1Questions: shuffledPart1Questions.length,
    part2Questions: shuffledPart2Questions.length,
  })

  // Use the order-matched quiz for progress/submission. A lesson can have
  // more than one multipleChoice quiz (e.g. "Multiple Choice Transcription"
  // and "Regional Options"); keying off quizType alone would always resolve
  // to the first one and conflate their progress/answers.
  const multipleChoiceQuiz = quizData
  console.log('🎯 Multiple choice quiz:', multipleChoiceQuiz)

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (!multipleChoiceQuiz) return

      try {
        const response = await fetch(
          `/api/userQuizProgress?quizId=${multipleChoiceQuiz.id}&lessonId=${lessonId}`,
        )
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.isCompleted)

          // Restore saved answers
          if (data.answers && data.answers.length > 0) {
            const savedAnswers: Record<number, number> = {}
            data.answers.forEach((answer: any) => {
              savedAnswers[answer.questionId] = parseInt(answer.textAnswer)
            })
            setSelectedAnswers(savedAnswers)
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [multipleChoiceQuiz, lessonId])

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    // Once completed, answers are locked in place until "Try again".
    if (isCompleted) return
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answerId,
    }))
  }

  const isQuestionCorrect = (questionId: number) => {
    const selectedAnswer = selectedAnswers[questionId]
    const question = multipleChoiceQuiz?.questions.find(
      (q) => q.id === questionId,
    )
    const correctOption = question?.answerOptions.find(
      (option) => option.isCorrect,
    )
    return selectedAnswer === correctOption?.id
  }

  const underlineText = (text: string, category: string) => {
    if (category === 'Last Two') {
      return (
        <Text as="span">
          {text.slice(0, -2)}
          <Text as="u">{text.slice(-2)}</Text>
        </Text>
      )
    } else if (category === 'Last Three') {
      return (
        <Text as="span">
          {text.slice(0, -3)}
          <Text as="u">{text.slice(-3)}</Text>
        </Text>
      )
    } else if (category === 'First') {
      return (
        <Text as="span">
          <Text as="u">{text.slice(0, 1)}</Text>
          {text.slice(1)}
        </Text>
      )
    } else if (category === 'First Two') {
      return (
        <Text as="span">
          <Text as="u">{text.slice(0, 2)}</Text>
          {text.slice(2)}
        </Text>
      )
    }
    return text
  }

  const handlePreviousPart = () => {
    if (currentPart === 2) {
      setCurrentPart(1)
    }
  }

  const handleNextPart = () => {
    if (currentPart === 1) {
      setCurrentPart(2)
    }
  }

  const handleFinish = async () => {
    await submitQuiz()
    onComplete()
  }

  const submitQuiz = async () => {
    if (!multipleChoiceQuiz) return

    setIsLoading(true)
    try {
      // Prepare answers in the format expected by the API
      const answersToSubmit = Object.entries(selectedAnswers).map(
        ([questionId, answerId]) => ({
          questionId: parseInt(questionId),
          textAnswer: answerId.toString(),
        }),
      )

      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: multipleChoiceQuiz.id,
          lessonId: lessonId,
          answers: answersToSubmit,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
      } else {
        console.error('Failed to submit quiz')
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
      toast({
        title: 'Error',
        description: 'Failed to save your answers. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isPartComplete = (part: number) => {
    const questions =
      part === 1 ? shuffledPart1Questions : shuffledPart2Questions
    return questions.every((question) => selectedAnswers[question.id])
  }

  const renderQuestion = (question: any) => (
    <Box
      key={question.id}
      width="100%"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      p={{ base: 4, md: 5 }}
    >
      <Flex alignItems="center" mb={4}>
        {/* Symbol prompts carry combining diacritics (e.g. the breve in
            [aɪ̆ə̆]); the body font mispositions them, so render the
            prompt in the IPA stack like the answer buttons already do. */}
        <Text fontFamily="ipa" fontWeight="bold" mr={4} fontSize="2xl">
          {question.text?.includes('{')
            ? renderUnderlined(question.text)
            : question.categories && question.categories.length > 0
            ? underlineText(question.text, question.categories[0])
            : question.text}
        </Text>
        {question.audioUrl && <AudioButton audioUrl={question.audioUrl} />}
      </Flex>
      {/* Options size to their content instead of stretching across a grid:
          most are a single IPA symbol, but some are whole words. Wrapping
          keeps them tight on desktop and reflows them on tablet/phone. */}
      <Flex wrap="wrap" gap={{ base: 2, md: 3 }} width="100%">
        {(
          shuffledOptionsByQuestion[question.id] ?? question.answerOptions
        ).map((option: AnswerOption) => (
          <Button
            key={option.id}
            onClick={() => handleAnswerSelect(question.id, option.id)}
            fontFamily="ipa"
            fontSize={{ base: 'md', md: 'lg' }}
            minW={{ base: '60px', md: '68px' }}
            maxW="100%"
            h="auto"
            px={{ base: 3, md: 4 }}
            py={{ base: 2, md: 2.5 }}
            whiteSpace="normal"
            variant={
              selectedAnswers[question.id] === option.id ? 'solid' : 'outline'
            }
            colorScheme={
              selectedAnswers[question.id] === option.id
                ? isQuestionCorrect(question.id)
                  ? 'green'
                  : 'red'
                : 'gray'
            }
          >
            {renderUnderlined(option.optionText)}
          </Button>
        ))}
      </Flex>
      {(() => {
        const selectedId = selectedAnswers[question.id]
        if (!selectedId || isQuestionCorrect(question.id)) return null
        const selected = question.answerOptions.find(
          (o: AnswerOption) => o.id === selectedId,
        )
        return selected?.feedback ? (
          <Text mt={3} fontSize="sm" fontStyle="italic" color="orange.600">
            {selected.feedback}
          </Text>
        ) : null
      })()}
    </Box>
  )

  // A quiz is "two-part" only when some questions carry a category (the
  // Consonants/Vowels symbol⇄word exercise). Otherwise it's a single-page
  // quiz (e.g. word→transcription multiple choice) and we skip the empty
  // first part and its symbol-matching instructions.
  const hasParts = shuffledPart1Questions.length > 0

  if (!multipleChoiceQuiz) return <QuizSkeleton />

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
          {!hasParts
            ? 'Instructions: Choose the correct transcription for the presented word in a General American Dialect.'
            : currentPart === 1
            ? 'Instructions: Choose the correct symbol that matches the sound in the underlined part of the word. Click the "Play Audio" button to hear the word.'
            : 'Instructions: Choose the correct word that contains the sound of the presented symbol. Click the "Play Audio" button to hear the symbol.'}
        </Text>
        {(!hasParts || currentPart === 1) && (
          <Flex
            mb={8}
            gap={3}
            align="flex-start"
            bg="purple.50"
            borderLeft="4px solid"
            borderColor="brand.iris"
            borderRadius="md"
            p={4}
          >
            <Icon
              as={MdAutoAwesome}
              color="brand.iris"
              boxSize={5}
              mt="2px"
              flexShrink={0}
              aria-hidden
            />
            <Text fontFamily="body" fontSize="sm" color="purple.900">
              Note: when doing these exercises you may be tempted to check a
              dictionary to help you with these answers – we caution you that
              the dictionary&apos;s transcription may be more broad than what we
              are teaching you, therefore not as helpful. When in doubt, check
              the "Expanded Lexical Sets" worksheet from module 2.
            </Text>
          </Flex>
        )}
      </Box>
      {/* Question cards pair up on wide screens so the options don't trail
          off into empty space, and fall back to one column on iPad/mobile. */}
      {hasParts && currentPart === 1 && (
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 4, md: 5 }}
          alignItems="start"
        >
          {shuffledPart1Questions.map(renderQuestion)}
        </SimpleGrid>
      )}
      {(!hasParts || currentPart === 2) && (
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 4, md: 5 }}
          alignItems="start"
        >
          {shuffledPart2Questions.map(renderQuestion)}
        </SimpleGrid>
      )}
      <QuizNavigation
        currentQuestion={hasParts ? currentPart : 1}
        totalQuestions={hasParts ? 2 : 1}
        onPrevious={handlePreviousPart}
        onNext={handleNextPart}
        onFinish={handleFinish}
        isNextDisabled={
          !isPartComplete(hasParts ? currentPart : 2) || isLoading
        }
        isCompleted={isCompleted}
      />
    </Box>
  )
}

export default MultipleChoiceQuiz
