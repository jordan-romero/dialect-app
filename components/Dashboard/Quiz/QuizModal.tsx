import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { AnswerOption, Categories } from './QuizTypes'
import useQuiz from './utils'
import RhymingPairsQuestion from './RhymingPairsQuestion'
import RhymingCategoriesQuestion from './RhymingCategoriesQuestion'
import {
  handleDragEndRhymingPairs,
  handleDragEndRhymingCategories,
} from './dragHandlers'

interface DragAndDropQuizModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: number
}

const DragAndDropQuizModal: React.FC<DragAndDropQuizModalProps> = ({
  isOpen,
  onClose,
  lessonId,
}) => {
  const { quizData } = useQuiz(isOpen, lessonId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [rhymingWords, setRhymingWords] = useState<AnswerOption[]>([])
  const [answeredWords, setAnsweredWords] = useState<AnswerOption[]>([])
  const [categories, setCategories] = useState<Categories>({})
  const [wordBank, setWordBank] = useState<AnswerOption[]>([])

  const currentQuestion = quizData?.questions[currentQuestionIndex]

  useEffect(() => {
    if (!currentQuestion) {
      return // Early return if there's no current question
    }

    if (currentQuestion.questionType === 'rhymingPairs') {
      setAnsweredWords([...(currentQuestion.answerOptions || [])])
      setRhymingWords([])
    } else if (currentQuestion.questionType === 'rhymingCategories') {
      setWordBank([...(currentQuestion.answerOptions || [])])

      // Ensure initialCategories conforms to the Categories interface
      const initialCategories: Categories = currentQuestion.categories
        ? Object.keys(currentQuestion.categories).reduce((acc, category) => {
            acc[category] = [] // Initialize an empty array for each category
            return acc
          }, {} as Categories)
        : {}

      setCategories(initialCategories)
    }
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quiz</ModalHeader>
          <ModalBody>
            {currentQuestion && (
              <>
                {currentQuestion.questionType === 'rhymingPairs' && (
                  <RhymingPairsQuestion
                    question={currentQuestion}
                    rhymingWords={rhymingWords}
                    answeredWords={answeredWords}
                  />
                )}
                {currentQuestion.questionType === 'rhymingCategories' && (
                  <RhymingCategoriesQuestion
                    question={currentQuestion}
                    categories={categories}
                    wordBank={wordBank}
                  />
                )}
              </>
            )}
          </ModalBody>
          {quizData && quizData.questions && (
            <ModalFooter>
              <Button
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                mr={4}
                isDisabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(
                      quizData.questions.length - 1,
                      currentQuestionIndex + 1,
                    ),
                  )
                }
                isDisabled={
                  currentQuestionIndex === quizData.questions.length - 1
                }
              >
                Next
              </Button>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </DragDropContext>
  )
}

export default DragAndDropQuizModal
