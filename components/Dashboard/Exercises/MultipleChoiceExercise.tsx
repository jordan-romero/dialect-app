/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react'
import { Button, Box, Text, SimpleGrid, Icon, Flex } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { MdVolumeUp } from 'react-icons/md'
import useQuiz from './utils'
import { AnswerOption } from './QuizTypes'

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
  const [part1Complete, setPart1Complete] = useState(false)
  const [shuffledPart1Questions, setShuffledPart1Questions] = useState<any[]>(
    [],
  )
  const [shuffledPart2Questions, setShuffledPart2Questions] = useState<any[]>(
    [],
  )

  const quizData = quizzes[quizIndex]

  useEffect(() => {
    if (
      shuffledPart1Questions &&
      Object.keys(selectedAnswers).length === shuffledPart1Questions.length
    ) {
      setPart1Complete(true)
    }
  }, [shuffledPart1Questions, selectedAnswers])

  useEffect(() => {
    if (quizData?.questions) {
      const part1 = quizData.questions.filter(
        (question) => question.categories?.[0] !== undefined,
      )
      const part2 = quizData.questions.filter(
        (question) => question.categories?.[0] === undefined,
      )

      const shuffledPart1 = part1.map((question) => ({
        ...question,
        answerOptions: shuffleArray(question.answerOptions),
      }))

      const shuffledPart2 = part2.map((question) => ({
        ...question,
        answerOptions: shuffleArray(question.answerOptions),
      }))

      setShuffledPart1Questions(shuffledPart1)
      setShuffledPart2Questions(shuffledPart2)
    }
  }, [quizData?.questions])

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

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answerId,
    }))
  }

  const isQuestionCorrect = (questionId: number) => {
    const selectedAnswer = selectedAnswers[questionId]
    const question = quizData?.questions.find((q) => q.id === questionId)
    const correctOption = question?.answerOptions.find(
      (option) => option.isCorrect,
    )
    return selectedAnswer === correctOption?.id
  }

  const isQuizComplete = () => {
    onComplete()
    return (
      quizData?.questions.length === Object.keys(selectedAnswers).length &&
      Object.values(selectedAnswers).every((answerId) => answerId !== undefined)
    )
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

  const renderQuestion = (question: any) => (
    <Box key={question.id} mb={8} width="100%">
      <Flex alignItems="center" mb={4}>
        <Text fontWeight="bold" mr={4} fontSize="2xl">
          {question.categories && question.categories.length > 0
            ? underlineText(question.text, question.categories[0])
            : question.text}
        </Text>
        {question.audioUrl && <AudioButton audioUrl={question.audioUrl} />}
      </Flex>
      <SimpleGrid columns={2} spacing={4} width="100%">
        {question.answerOptions.map((option: AnswerOption) => (
          <Button
            key={option.id}
            onClick={() => handleAnswerSelect(question.id, option.id)}
            fontFamily="'Charis SIL', serif"
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
            {option.optionText}
            {selectedAnswers[question.id] === option.id &&
              isQuestionCorrect(question.id) && (
                <Icon
                  as={CheckCircleIcon}
                  color="green.500"
                  ml={2}
                  boxSize={4}
                />
              )}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  )

  return (
    <Box>
      {currentPart === 1 && (
        <>
          <Box
            position="sticky"
            top="0"
            bg="white"
            zIndex="1"
            py={4}
            borderColor="gray.200"
          >
            <Text fontStyle="italic" mb={4}>
              Instructions: Choose the correct symbol that matches the sound in
              the underlined part of the word. Click the "Play Audio" button to
              hear the word.
            </Text>
            <Text fontFamily="'Charis SIL', serif" mb={8}>
              Note, when doing these exercises you may be tempted to check a
              dictionary to "help" you with these answers – we caution you that
              the transcription might be more "broad" than what we are teaching
              you, therefore not as helpful. When in doubt, check the "Expanded
              Lexical Sets" worksheet from section 2.
            </Text>
          </Box>
          {shuffledPart1Questions?.map(renderQuestion)}
        </>
      )}
      {currentPart === 2 && (
        <>
          <Box
            position="sticky"
            top="0"
            bg="white"
            zIndex="1"
            py={4}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Text fontStyle="italic" mb={8}>
              Instructions: Choose the correct word that contains the sound of
              the presented symbol. Click the "Play Audio" button to hear the
              symbol.
            </Text>
          </Box>
          {shuffledPart2Questions?.map(renderQuestion)}
        </>
      )}
      {currentPart === 1 && (
        <Button
          onClick={() => setCurrentPart(2)}
          variant="brandBold"
          mt={8}
          isDisabled={!part1Complete}
        >
          Next Part
        </Button>
      )}
      {currentPart === 2 && (
        <Button
          onClick={() => {}}
          variant="brandBold"
          mt={8}
          isDisabled={!isQuizComplete()}
        >
          Submit Quiz
        </Button>
      )}
    </Box>
  )
}

export default MultipleChoiceQuiz
