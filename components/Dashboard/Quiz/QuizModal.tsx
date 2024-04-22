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
  const [selectedOptions, setSelectedOptions] = useState<{
    [questionId: number]: number[]
  }>({})
  const [showCorrectMessage, setShowCorrectMessage] = useState<{
    [questionId: number]: boolean
  }>({})

  useEffect(() => {
    const fetchQuizData = async () => {
      if (isOpen && lessonId) {
        const response = await fetch(`/api/quiz?lessonId=${lessonId}`)
        const data: QuizData = await response.json()
        setQuizData(data)
        setSelectedOptions(
          data.questions.reduce((acc, question) => {
            acc[question.id] = []
            return acc
          }, {} as { [questionId: number]: number[] }),
        )
        setShowCorrectMessage(
          data.questions.reduce((acc, question) => {
            acc[question.id] = false
            return acc
          }, {} as { [questionId: number]: boolean }),
        )
      }
    }

    fetchQuizData()
  }, [isOpen, lessonId])

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
  ) => {
    const question = quizData?.questions.find((q) => q.id === questionId)
    const option1 = question?.answerOptions.find(
      (option) => option.id === optionId1,
    )
    const option2 = question?.answerOptions.find(
      (option) => option.id === optionId2,
    )

    return option1?.rhymingWordId === option2?.id
  }

  useEffect(() => {
    Object.keys(selectedOptions).forEach((questionId) => {
      const selectedOptionIds = selectedOptions[parseInt(questionId)]
      if (selectedOptionIds.length === 2) {
        const [optionId1, optionId2] = selectedOptionIds
        if (isRhyming(parseInt(questionId), optionId1, optionId2)) {
          setShowCorrectMessage((prevShowCorrectMessage) => ({
            ...prevShowCorrectMessage,
            [parseInt(questionId)]: true,
          }))
          setTimeout(() => {
            setSelectedOptions((prevSelectedOptions) => ({
              ...prevSelectedOptions,
              [parseInt(questionId)]: [],
            }))
            setShowCorrectMessage((prevShowCorrectMessage) => ({
              ...prevShowCorrectMessage,
              [parseInt(questionId)]: false,
            }))
          }, 2000)
        }
      }
    })
  }, [selectedOptions, quizData])

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
                {quizData.questions.map((question) => (
                  <Box key={question.id} width="100%">
                    <Text mb={4}>{question.text}</Text>
                    <HStack spacing={8}>
                      <Box width="50%">
                        <Droppable droppableId={`options-${question.id}`}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              bg="gray.100"
                              p={4}
                              minH="200px"
                            >
                              {question.answerOptions
                                .filter(
                                  (option) =>
                                    !selectedOptions[question.id].includes(
                                      option.id,
                                    ),
                                )
                                .map((option, index) => (
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
                                        onClick={() =>
                                          playAudio(option.audioUrl)
                                        }
                                        cursor="pointer"
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
                      </Box>
                      <Box width="50%">
                        <Text mb={4}>Drag and drop two rhyming words:</Text>
                        <Droppable droppableId={`selected-${question.id}`}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              bg="gray.100"
                              p={4}
                              minH="200px"
                            >
                              <VStack spacing={2}>
                                {selectedOptions[question.id].map(
                                  (optionId, index) => {
                                    const isMatched = selectedOptions[
                                      question.id
                                    ].some((id) =>
                                      isRhyming(question.id, optionId, id),
                                    )
                                    return (
                                      <Draggable
                                        key={optionId}
                                        draggableId={`selected-${optionId}`}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            bg={
                                              isMatched ? 'green.500' : 'white'
                                            }
                                            color={
                                              isMatched ? 'white' : 'inherit'
                                            }
                                            p={2}
                                            borderRadius="md"
                                            boxShadow="md"
                                            onClick={() => {
                                              const option =
                                                question.answerOptions.find(
                                                  (option) =>
                                                    option.id === optionId,
                                                )
                                              if (option) {
                                                playAudio(option.audioUrl)
                                              }
                                            }}
                                            cursor="pointer"
                                          >
                                            {
                                              question.answerOptions.find(
                                                (option) =>
                                                  option.id === optionId,
                                              )?.optionText
                                            }
                                          </Box>
                                        )}
                                      </Draggable>
                                    )
                                  },
                                )}
                                {provided.placeholder}
                              </VStack>
                            </Box>
                          )}
                        </Droppable>
                      </Box>
                    </HStack>
                    {showCorrectMessage[question.id] && (
                      <Box mt={4}>
                        <Text color="green.500" fontWeight="bold">
                          Correct!
                        </Text>
                      </Box>
                    )}
                  </Box>
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
