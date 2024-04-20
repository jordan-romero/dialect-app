import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd'
import { QuizData } from './QuizTypes'

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: number
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, lessonId }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null)

  useEffect(() => {
    const fetchQuizData = async () => {
      if (isOpen && lessonId) {
        const response = await fetch(`/api/quiz?lessonId=${lessonId}`)
        const data: QuizData = await response.json()
        setQuizData(data)
      }
    }

    fetchQuizData()
  }, [isOpen, lessonId])

  const handleDragEnd = (result: DropResult) => {
    // Handle drag and drop logic here
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quiz</ModalHeader>
        <ModalBody>
          {quizData && (
            <VStack spacing={8}>
              {quizData.questions.map((question) => (
                <Box key={question.id}>
                  <Text mb={4}>{question.text}</Text>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <HStack spacing={8}>
                      <Droppable droppableId={`options-${question.id}`}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            bg="gray.100"
                            p={4}
                            minH="200px"
                            width="50%"
                          >
                            {question.answerOptions.map((option, index) => (
                              <Draggable
                                key={option.id}
                                draggableId={`option-${option.id}`}
                                index={index}
                              >
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    bg="white"
                                    p={2}
                                    mb={2}
                                    borderRadius="md"
                                    boxShadow="md"
                                  >
                                    {option.optionText}
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                      <Droppable droppableId={`selected-${question.id}`}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            bg="gray.100"
                            p={4}
                            minH="200px"
                            width="50%"
                          >
                            {/* Render selected options here */}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </HStack>
                  </DragDropContext>
                </Box>
              ))}
            </VStack>
          )}
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
