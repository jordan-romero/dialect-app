// QuizModal.tsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Box,
  Text,
} from '@chakra-ui/react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import useQuiz from './utils'
import { Question } from './QuizTypes'
import DragAndDropAnswerUI from './DragAndDropAnswerUi'

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: number
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, lessonId }) => {
  const { quizData, selectedOptions, setSelectedOptions } = useQuiz(
    isOpen,
    lessonId,
  )

  const handleDragEnd = (questionId: number, result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const optionId = parseInt(result.draggableId.split('-')[1])

    if (
      source.droppableId === `options-${questionId}` &&
      destination.droppableId === `selected-${questionId}`
    ) {
      if (selectedOptions[questionId].length >= 2) return

      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [questionId]: [...prevSelectedOptions[questionId], optionId],
      }))
    } else if (
      source.droppableId === `selected-${questionId}` &&
      destination.droppableId === `options-${questionId}`
    ) {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [questionId]: prevSelectedOptions[questionId].filter(
          (id) => id !== optionId,
        ),
      }))
    }
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const isRhyming = (
    questionId: number,
    optionId1: number,
    optionId2: number,
  ): boolean => {
    const question = quizData?.questions.find((q) => q.id === questionId)
    const option1 = question?.answerOptions.find(
      (option) => option.id === optionId1,
    )
    const option2 = question?.answerOptions.find(
      (option) => option.id === optionId2,
    )

    return option1?.rhymingWordId === option2?.id
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quiz</ModalHeader>
        <ModalBody>
          <DragDropContext
            onDragEnd={(result) => {
              const { source } = result
              const questionId = parseInt(source.droppableId.split('-')[1])
              handleDragEnd(questionId, result)
            }}
          >
            {quizData && (
              <VStack spacing={8}>
                {quizData.questions.map((question: Question) => (
                  <React.Fragment key={question.id}>
                    {question.questionType === 'dragAndDrop' && (
                      <DragAndDropAnswerUI
                        question={question}
                        selectedOptions={selectedOptions[question.id]}
                        onOptionClick={(optionId: any) =>
                          playAudio(
                            question.answerOptions.find(
                              (option: { id: any }) => option.id === optionId,
                            )?.audioUrl || '',
                          )
                        }
                        isMatched={(optionId: number) =>
                          selectedOptions[question.id].some((id) =>
                            isRhyming(question.id, optionId, id),
                          )
                        }
                        isRhyming={isRhyming}
                      />
                    )}
                  </React.Fragment>
                ))}
              </VStack>
            )}
          </DragDropContext>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QuizModal
