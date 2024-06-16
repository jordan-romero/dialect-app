import React, { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { AnswerOption, Categories, Question } from '../QuizTypes'
import useQuiz from '../utils'
import RhymingPairsQuestion from './RhymingPairsQuestion'
import RhymingCategoriesQuestion from './RhymingCategoriesQuestion'
import {
  handleDragEndRhymingPairs,
  handleDragEndRhymingCategories,
} from './dragHandlers'
import { Box, Button, Icon } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

interface DragAndDropExerciseProps {
  lessonId: number
}

const DragAndDropExercise: React.FC<DragAndDropExerciseProps> = ({
  lessonId,
}) => {
  const { quizData } = useQuiz(lessonId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [rhymingWords, setRhymingWords] = useState<AnswerOption[]>([])
  const [answeredWords, setAnsweredWords] = useState<AnswerOption[]>([])
  const [categories, setCategories] = useState<Categories>({})
  const [wordBank, setWordBank] = useState<AnswerOption[]>([])
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)
  const [isQuizComplete, setIsQuizComplete] = useState(false)

  const currentQuestion: Question | undefined =
    quizData?.questions[currentQuestionIndex]

  useEffect(() => {
    if (!currentQuestion) {
      return
    }

    if (currentQuestion.questionType === 'rhymingPairs') {
      setAnsweredWords([...(currentQuestion.answerOptions || [])])
      setRhymingWords([])
    } else if (currentQuestion.questionType === 'rhymingCategories') {
      setWordBank([...(currentQuestion.answerOptions || [])])
      const initialCategories: Categories = currentQuestion.categories
        ? Object.keys(currentQuestion.categories).reduce((acc, category) => {
            acc[category] = []
            return acc
          }, {} as Categories)
        : {}
      setCategories(initialCategories)
    }
    setIsQuestionComplete(false)
  }, [currentQuestion])

  useEffect(() => {
    if (!currentQuestion || !currentQuestion.categories) return // Ensures the current question is available before proceeding.

    if (currentQuestion.questionType === 'rhymingPairs') {
      const isComplete =
        answeredWords.length > 0 &&
        answeredWords.every((word) => word.rhymingWordId === null)
      setIsQuestionComplete(isComplete)
    } else if (currentQuestion.questionType === 'rhymingCategories') {
      // Correct calculation for uncategorized words count
      const uncategorizedWordsCount = currentQuestion.answerOptions.filter(
        (word) => word.rhymeCategory === null,
      ).length

      // Set question complete if word bank is empty or matches uncategorized words count
      if (
        wordBank.length === 0 ||
        wordBank.length === uncategorizedWordsCount
      ) {
        setIsQuestionComplete(true)
      } else {
        setIsQuestionComplete(false) // Ensure that the state is explicitly set in all cases
      }
    }
  }, [currentQuestion, rhymingWords, answeredWords, wordBank, categories])

  const handleDragEnd = (result: DropResult) => {
    if (currentQuestion?.questionType === 'rhymingPairs') {
      handleDragEndRhymingPairs(
        result,
        rhymingWords,
        setRhymingWords,
        answeredWords,
        setAnsweredWords,
      )
    } else if (currentQuestion?.questionType === 'rhymingCategories') {
      handleDragEndRhymingCategories(
        result,
        categories,
        setCategories,
        wordBank,
        setWordBank,
      )
    }
  }

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
      setAudioPlaying(audioUrl)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex === quizData?.questions.length! - 1) {
      setIsQuizComplete(true)
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setIsQuestionComplete(false)
      setRhymingWords([])
      setAnsweredWords([])
      setCategories({})
      setWordBank([])
    }
  }

  const handleRhymingPairsQuestionComplete = () => {
    setIsQuestionComplete(true)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box>
        {currentQuestion && (
          <>
            {currentQuestion.questionType === 'rhymingPairs' && (
              <RhymingPairsQuestion
                question={currentQuestion}
                playAudio={playAudio}
                onQuestionComplete={handleRhymingPairsQuestionComplete}
              />
            )}
            {currentQuestion.questionType === 'rhymingCategories' && (
              <RhymingCategoriesQuestion
                question={currentQuestion}
                categories={categories}
                wordBank={wordBank}
                playAudio={playAudio}
              />
            )}
          </>
        )}
        {isQuestionComplete && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={1}
            backgroundColor="rgba(255, 255, 255, 0.8)"
            padding={4}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={CheckCircleIcon} color="green.500" boxSize={8} mr={2} />
            <Box fontWeight="bold" fontSize="xl">
              Correct!
            </Box>
          </Box>
        )}
      </Box>
      {quizData && quizData.questions && (
        <Box mt={4}>
          <Button
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            mr={4}
            isDisabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button onClick={handleNextQuestion} isDisabled={!isQuestionComplete}>
            {currentQuestionIndex === quizData.questions.length - 1
              ? 'Finish Quiz'
              : 'Next'}
          </Button>
        </Box>
      )}
    </DragDropContext>
  )
}

export default DragAndDropExercise
