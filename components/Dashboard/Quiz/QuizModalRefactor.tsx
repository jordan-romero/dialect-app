import React, { useState } from 'react'
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
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import useQuiz from './utils'
import { Question, AnswerOption } from './QuizTypes'

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
  const [rhymingWords, setRhymingWords] = useState<AnswerOption[]>([])

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return // No destination found, nothing to do

    // If item is dropped in the same place, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (quizData && quizData.questions[0].answerOptions) {
      const sourceItems = quizData.questions[0].answerOptions
      const movedItem = sourceItems[source.index]

      if (destination.droppableId === 'rhymingBox') {
        let newRhymingWords = Array.from(rhymingWords)

        // Remove the item from its original position if it exists in rhymingWords
        newRhymingWords = newRhymingWords.filter(
          (item) => item.id !== movedItem.id,
        )
        // Add to the new position
        newRhymingWords.splice(destination.index, 0, movedItem)

        // Limit to 2 items in the rhyming box
        if (newRhymingWords.length <= 2) {
          setRhymingWords(newRhymingWords)
        }
      } else {
        // Handle if the destination is not rhyming box
        // For example, moving back to word bank or another list
        let newRhymingWords = rhymingWords.filter(
          (item) => item.id !== movedItem.id,
        )
        setRhymingWords(newRhymingWords)
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quiz</ModalHeader>
        <ModalBody>
          <DragDropContext onDragEnd={handleDragEnd}>
            {quizData && (
              <VStack spacing={8}>
                {quizData.questions.map((question: Question) => (
                  <React.Fragment key={question.id}>
                    {question.questionType === 'dragAndDrop' && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Droppable droppableId="wordBank">
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              backgroundColor="gray.100"
                              padding={4}
                              width="45%"
                            >
                              <Text fontWeight="bold" marginBottom={2}>
                                Word Bank
                              </Text>
                              {question.answerOptions.map((word, index) => (
                                <Draggable
                                  key={word.id}
                                  draggableId={word.id.toString()}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      backgroundColor="white"
                                      padding={2}
                                      marginBottom={2}
                                      boxShadow="md"
                                      borderRadius="md"
                                    >
                                      {word.optionText}
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                        <Droppable droppableId="rhymingBox">
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              backgroundColor="gray.100"
                              padding={4}
                              width="45%"
                            >
                              <Text fontWeight="bold" marginBottom={2}>
                                Rhyming Words
                              </Text>
                              {rhymingWords.map((word, index) => (
                                <Draggable
                                  key={word.id}
                                  draggableId={word.id.toString()}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      backgroundColor={
                                        rhymingWords.length === 2 &&
                                        rhymingWords[0].rhymingWordId ===
                                          rhymingWords[1].id
                                          ? 'green.200'
                                          : 'red.200'
                                      }
                                      padding={2}
                                      marginBottom={2}
                                      boxShadow="md"
                                      borderRadius="md"
                                    >
                                      {word.optionText}
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Box>
                    )}
                  </React.Fragment>
                ))}
              </VStack>
            )}
          </DragDropContext>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={() => {}} marginRight={4}>
            Check
          </Button>
          <Button colorScheme="gray" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QuizModal
