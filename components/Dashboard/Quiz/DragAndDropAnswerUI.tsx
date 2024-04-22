import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Question } from './QuizTypes'

interface DragAndDropAnswerUIProps {
  question: Question
  selectedOptions: number[]
  onOptionClick: (optionId: number) => void
  isMatched: (optionId: number) => boolean
  isRhyming: (
    questionId: number,
    optionId1: number,
    optionId2: number,
  ) => boolean
}

const DragAndDropAnswerUI: React.FC<DragAndDropAnswerUIProps> = ({
  question,
  selectedOptions,
  onOptionClick,
  isMatched,
  isRhyming,
}) => {
  return (
    <Box width="100%">
      <Text mb={4}>{question.text}</Text>
      <Box display="flex" justifyContent="space-between">
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
                  .filter((option) => !selectedOptions.includes(option.id))
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
                          onClick={() => onOptionClick(option.id)}
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
                  {selectedOptions.map((optionId, index) => {
                    const isMatched = selectedOptions.some((id) =>
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
                              isMatched
                                ? 'green.500'
                                : !isMatched
                                ? 'red.500'
                                : 'white'
                            }
                            color={
                              isMatched
                                ? 'white'
                                : !isMatched
                                ? 'white'
                                : 'inherit'
                            }
                            p={2}
                            borderRadius="md"
                            boxShadow="md"
                            onClick={() => onOptionClick(optionId)}
                            cursor="pointer"
                          >
                            {
                              question.answerOptions.find(
                                (option) => option.id === optionId,
                              )?.optionText
                            }
                          </Box>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </VStack>
              </Box>
            )}
          </Droppable>
        </Box>
      </Box>
    </Box>
  )
}

export default DragAndDropAnswerUI
