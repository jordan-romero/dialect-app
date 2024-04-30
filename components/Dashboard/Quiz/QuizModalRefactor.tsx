import React, { useEffect, useState } from 'react'
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
  const [answeredWords, setAnsweredWords] = useState<AnswerOption[]>([])

  useEffect(() => {
    if (quizData && quizData.questions[0].answerOptions) {
      setAnsweredWords(quizData.questions[0].answerOptions)
    }
  }, [quizData])

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
      const sourceItems = answeredWords
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
          setAnsweredWords((prevAnsweredWords) =>
            prevAnsweredWords.filter((word) => word.id !== movedItem.id),
          )

          if (newRhymingWords.length === 2) {
            if (newRhymingWords[0].rhymingWordId === newRhymingWords[1].id) {
              // Answers are correct
              setTimeout(() => {
                setRhymingWords([])
              }, 1000) // Remove the words after 1 second
            } else {
              // Answers are wrong
              setTimeout(() => {
                setRhymingWords([])
                setAnsweredWords((prevAnsweredWords) => [
                  ...prevAnsweredWords,
                  ...newRhymingWords,
                ])
              }, 1000) // Return the words to the word bank after 1 second
            }
          }
        }
      }
    }
  }

  const playAudioClip = (word: AnswerOption) => {
    const audioUrl = word.audioUrl
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
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
                              {answeredWords.map((word, index) => (
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
                                      onMouseDown={(event) => {
                                        if (event.button === 0) {
                                          // Only trigger audio playback on left mouse button click
                                          playAudioClip(word)
                                        }
                                      }}
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
      </ModalContent>
    </Modal>
  )
}

export default QuizModal
