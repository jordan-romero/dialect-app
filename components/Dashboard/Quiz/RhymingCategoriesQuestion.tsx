// RhymingCategoriesQuestion.tsx
import React from 'react'
import { Box, Text } from '@chakra-ui/react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Question, AnswerOption } from './QuizTypes'

interface RhymingCategoriesQuestionProps {
  question: Question
  categories: { [key: string]: AnswerOption[] }
  wordBank: AnswerOption[]
}

const RhymingCategoriesQuestion: React.FC<RhymingCategoriesQuestionProps> = ({
  question,
  categories,
  wordBank,
}) => {
  const isWordCorrect = (word: AnswerOption, category: string) => {
    return word.rhymeCategory === category
  }

  return (
    <Box>
      <Text fontWeight="bold" mb={4}>
        {question.text}
      </Text>
      <Box display="flex" justifyContent="space-between">
        <Droppable droppableId="wordBank">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              bg="gray.100"
              p={4}
              width="45%"
            >
              <Text fontWeight="bold" mb={2}>
                Word Bank
              </Text>
              {wordBank.map((word, index) => (
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
                      bg="white"
                      p={2}
                      mb={2}
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
        {question.categories &&
          question.categories?.map((category: any) => (
            <Droppable key={category} droppableId={category}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  bg="gray.100"
                  p={4}
                  width="45%"
                >
                  <Text fontWeight="bold" mb={2}>
                    {category}
                  </Text>
                  {categories[category] &&
                    categories[category].map((word, index) => (
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
                            bg={
                              isWordCorrect(word, category)
                                ? 'green.100'
                                : 'red.100'
                            }
                            color={
                              isWordCorrect(word, category)
                                ? 'green.800'
                                : 'red.800'
                            }
                            p={2}
                            mb={2}
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
          ))}
      </Box>
    </Box>
  )
}

export default RhymingCategoriesQuestion
