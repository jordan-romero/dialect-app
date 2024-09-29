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
import { Box } from '@chakra-ui/react'
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

  const handleRhymingCategoriesQuestionStatusChange = () => {
    console.log('Current categories:', categories)
    console.log('Current wordBank:', wordBank)

    const allCategoriesCorrect = Object.entries(categories).every(
      ([category, words]) => {
        if (category.toLowerCase() === 'thought') {
          // For 'thought' category:
          // 1. Check if all placed words don't rhyme with 'thought'
          // 2. Check if the number of placed words equals the total number of non-rhyming words
          const correctWordsPlaced = words.every(
            (word) => word.rhymeCategory !== 'thought',
          )
          const totalNonRhymingWords =
            currentQuestion?.answerOptions.filter(
              (w) => w.rhymeCategory !== 'thought',
            ).length || 0
          const onlyCorrectWordsPlaced = words.length === totalNonRhymingWords

          console.log('Thought category check:')
          console.log('- Correct words placed:', correctWordsPlaced)
          console.log('- Only correct words placed:', onlyCorrectWordsPlaced)
          console.log('- Words in category:', words.length)
          console.log('- Total non-rhyming words:', totalNonRhymingWords)

          return correctWordsPlaced && onlyCorrectWordsPlaced
        } else {
          // For other categories, check if all words in the category are correct
          const categoryCorrect = words.every(
            (word) => word.rhymeCategory === category,
          )
          console.log(`${category} category check:`, categoryCorrect)
          return categoryCorrect
        }
      },
    )

    // Check if all words are placed for non-'thought' categories
    const allWordsPlacedForOtherCategories = Object.entries(categories).every(
      ([category, words]) => {
        if (category.toLowerCase() !== 'thought') {
          return (
            words.length ===
            currentQuestion?.answerOptions.filter(
              (w) => w.rhymeCategory === category,
            ).length
          )
        }
        return true
      },
    )

    // The wordBank should be empty except for the rhyming words in the 'thought' category
    const remainingWordsAreThoughtRhymes = wordBank.every(
      (word) => word.rhymeCategory === 'thought',
    )

    const finalIsComplete =
      allCategoriesCorrect &&
      allWordsPlacedForOtherCategories &&
      remainingWordsAreThoughtRhymes

    console.log('All categories correct:', allCategoriesCorrect)
    console.log(
      'All words placed for other categories:',
      allWordsPlacedForOtherCategories,
    )
    console.log(
      'Remaining words are thought rhymes:',
      remainingWordsAreThoughtRhymes,
    )
    console.log('Final isComplete status:', finalIsComplete)

    setIsQuestionComplete(finalIsComplete)
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
                onQuestionStatusChange={
                  handleRhymingCategoriesQuestionStatusChange
                }
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
