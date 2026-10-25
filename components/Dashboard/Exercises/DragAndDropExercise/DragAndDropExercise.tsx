import React, { useState, useEffect, useRef } from 'react'
import { shuffleArray } from '../shuffle'
import { DragDropContext, DragStart, DropResult } from '@hello-pangea/dnd'
import { AnswerOption, Categories, Question } from '../QuizTypes'
import useQuiz from '../utils'
import RhymingPairsQuestion from './RhymingPairsQuestion'
import RhymingCategoriesQuestion from './RhymingCategoriesQuestion'
import {
  handleDragEndRhymingPairs,
  handleDragEndRhymingCategories,
} from './dragHandlers'
import { Box, Text } from '@chakra-ui/react'
import QuizNavigation from '../QuizNavigation'
import QuizSkeleton from '../QuizSkeleton'

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
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Per-question solved board, restored from the server (set once on load).
  const [restored, setRestored] = useState<Record<number, any>>({})
  // Live capture of the current board per question (ref → no re-render churn).
  const boardRef = useRef<Record<number, any>>({})

  // LessonContainer passes the quiz's persisted `order`, which is not
  // necessarily its zero-based position in this response array.
  const currentQuiz =
    quizzes.find((quiz) => quiz.order === quizIndex) ?? quizzes[quizIndex]
  const currentQuestion: Question | undefined =
    currentQuiz?.questions[currentQuestionIndex]

  // Load saved progress when component mounts. A completed drag-and-drop quiz
  // stores each question's final board so we can show the answers back in
  // place (locked) until the learner clicks "Try again".
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentQuiz) return

      try {
        const response = await fetch(
          `/api/userQuizProgress?quizId=${currentQuiz.id}&lessonId=${lessonId}`,
        )
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.isCompleted)

          const restoredMap: Record<number, any> = {}
          ;(data.answers || []).forEach((a: any) => {
            if (a.textAnswer && a.textAnswer !== 'pending') {
              try {
                const parsed = JSON.parse(a.textAnswer)
                if (parsed) restoredMap[a.questionId] = parsed
              } catch {
                /* ignore non-JSON markers */
              }
            }
          })
          boardRef.current = { ...restoredMap }
          setRestored(restoredMap)
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [currentQuiz, lessonId])

  // Initialize the board for the current question — restored (if completed) or
  // empty defaults.
  useEffect(() => {
    if (!currentQuestion) {
      return
    }
    const saved = restored[currentQuestion.id]

    if (currentQuestion.questionType === 'rhymingPairs') {
      setAnsweredWords([...(currentQuestion.answerOptions || [])])
      setRhymingWords([])
    } else if (currentQuestion.questionType === 'rhymingCategories') {
      if (saved?.categories) {
        setCategories(saved.categories)
        setWordBank(saved.wordBank ?? [])
      } else {
        // Shuffled on a fresh start only — a restored bank keeps its saved
        // order so the board doesn't rearrange under the learner.
        setWordBank(shuffleArray(currentQuestion.answerOptions || []))
        const initialCategories: Categories = currentQuestion.categories
          ? Object.keys(currentQuestion.categories).reduce((acc, category) => {
              acc[category] = []
              return acc
            }, {} as Categories)
          : {}
        setCategories(initialCategories)
      }
    }
    setIsQuestionComplete(false)
  }, [currentQuestion, restored])

  // Capture the current rhymingCategories board into boardRef (only while the
  // quiz is still editable — never overwrite a restored, completed board).
  useEffect(() => {
    if (!currentQuestion || isCompleted) return
    if (currentQuestion.questionType === 'rhymingCategories') {
      boardRef.current[currentQuestion.id] = {
        type: 'categories',
        categories,
        wordBank,
      }
    }
  }, [categories, wordBank, currentQuestion, isCompleted])

  // Capture rhymingPairs matches reported by the child component.
  const handlePairsMatchedChange = (matchedIds: number[]) => {
    if (!currentQuestion || isCompleted) return
    boardRef.current[currentQuestion.id] = { type: 'pairs', matchedIds }
  }

  const handleDragEnd = (result: DropResult) => {
    // Locked once completed — answers stay in place until "Try again".
    if (isCompleted) return
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

  const handleDragStart = (start: DragStart) => {
    if (isCompleted || !currentQuestion) return

    const draggedWord = currentQuestion.answerOptions.find(
      (word) => word.id.toString() === start.draggableId,
    )
    if (draggedWord?.audioUrl) {
      playAudio(draggedWord.audioUrl)
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
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setIsQuestionComplete(false)
      setRhymingWords([])
      setAnsweredWords([])
      setCategories({})
      setWordBank([])
    }
  }

  const handleFinish = async () => {
    await submitQuiz()
    onComplete()
  }

  const submitQuiz = async () => {
    if (!currentQuiz) return

    setIsLoading(true)
    try {
      // Persist each question's actual final board so it can be shown back in
      // place when the learner returns. Falls back to a "completed" marker if a
      // question's board wasn't captured for some reason.
      const answersToSubmit = currentQuiz.questions.map((question) => ({
        questionId: question.id,
        textAnswer: boardRef.current[question.id]
          ? JSON.stringify(boardRef.current[question.id])
          : 'completed',
      }))

      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          lessonId: lessonId,
          answers: answersToSubmit,
        }),
      })

      if (response.ok) {
        setRestored({ ...boardRef.current })
        setIsCompleted(true)
      } else {
        console.error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRhymingPairsQuestionComplete = () => {
    setIsQuestionComplete(true)
  }

  const handleRhymingCategoriesQuestionStatusChange = () => {
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

          return correctWordsPlaced && onlyCorrectWordsPlaced
        } else {
          // For other categories, check if all words in the category are correct
          const categoryCorrect = words.every(
            (word) => word.rhymeCategory === category,
          )
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

    setIsQuestionComplete(finalIsComplete)
  }

  if (!currentQuiz) return <QuizSkeleton />

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        {currentQuestion && (
          <>
            {currentQuestion.questionType === 'rhymingPairs' && (
              <RhymingPairsQuestion
                question={currentQuestion}
                playAudio={playAudio}
                onQuestionComplete={handleRhymingPairsQuestionComplete}
                initialMatchedIds={restored[currentQuestion.id]?.matchedIds}
                locked={isCompleted}
                onMatchedChange={handlePairsMatchedChange}
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
          onFinish={handleFinish}
          // While completed, the quiz is locked but the learner can still page
          // through to review each restored board.
          isNextDisabled={!isQuestionComplete || isLoading}
          isCompleted={isCompleted}
        />
      )}
    </DragDropContext>
  )
}

export default DragAndDropExercise
