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
import { Box, Icon } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import QuizNavigation from '../QuizNavigation'

interface DragAndDropExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const DragAndDropExercise: React.FC<DragAndDropExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)

  console.log(quizzes, 'quizzes')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [rhymingWords, setRhymingWords] = useState<AnswerOption[]>([])
  const [answeredWords, setAnsweredWords] = useState<AnswerOption[]>([])
  const [categories, setCategories] = useState<Categories>({})
  const [wordBank, setWordBank] = useState<AnswerOption[]>([])
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)
  const [isQuizComplete, setIsQuizComplete] = useState(false)

  const currentQuiz = quizzes[quizIndex]
  const currentQuestion: Question | undefined =
    currentQuiz?.questions[currentQuestionIndex]

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
    if (!currentQuestion || !currentQuestion.categories) return

    if (currentQuestion.questionType === 'rhymingPairs') {
      const isComplete =
        answeredWords.length > 0 &&
        answeredWords.every((word) => word.rhymingWordId === null)
      setIsQuestionComplete(isComplete)
    } else if (currentQuestion.questionType === 'rhymingCategories') {
      const uncategorizedWordsCount = currentQuestion.answerOptions.filter(
        (word) => word.rhymeCategory === null,
      ).length

      if (
        wordBank.length === 0 ||
        wordBank.length === uncategorizedWordsCount
      ) {
        setIsQuestionComplete(true)
      } else {
        setIsQuestionComplete(false)
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

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex === currentQuiz?.questions.length! - 1) {
      setIsQuizComplete(true)
      onComplete()
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
      </Box>
      {currentQuiz && currentQuiz.questions && (
        <QuizNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={currentQuiz.questions.length}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onFinish={handleNextQuestion}
          isNextDisabled={!isQuestionComplete}
        />
      )}
    </DragDropContext>
  )
}

export default DragAndDropExercise
