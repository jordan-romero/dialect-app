import React from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Question, AnswerOption } from '../QuizTypes'

interface RhymingCategoriesQuestionProps {
  question: Question
  categories: { [key: string]: AnswerOption[] }
  wordBank: AnswerOption[]
  playAudio: (audioUrl: string) => void
}

const RhymingCategoriesQuestion: React.FC<RhymingCategoriesQuestionProps> = ({
  question,
  categories,
  wordBank,
  playAudio,
}) => {
  const isWordCorrect = (word: AnswerOption, category: string) => {
    return word.rhymeCategory === category
  }

  return (
    <Box>
      <Text fontWeight="bold" mb={4}>
        {question.text}
      </Text>
      <Flex flexDirection="column">
        <Box
          position="sticky"
          top="0"
          zIndex="1"
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          pb={4}
        >
          <Text fontWeight="bold" mb={2}>
            Word Bank
          </Text>
          <Droppable droppableId="wordBank" direction="horizontal">
            {(provided) => (
              <Flex
                ref={provided.innerRef}
                {...provided.droppableProps}
                bg="gray.100"
                p={4}
                flexWrap="wrap"
              >
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
                        m={1}
                        boxShadow="md"
                        borderRadius="md"
                        onMouseDown={() => playAudio(word.audioUrl)}
                      >
                        {word.optionText}
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Flex>
            )}
          </Droppable>
        </Box>
        <Flex flexWrap="wrap" justifyContent="space-between" mt={4}>
          {question.categories &&
            question.categories.map((category: string) => (
              <Droppable key={category} droppableId={category}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    bg="gray.100"
                    p={4}
                    width={['100%', '48%']}
                    mb={4}
                  >
                    <Text fontWeight="bold" mb={2}>
                      {category}
                    </Text>
                    <Flex flexDirection="column">
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
                    </Flex>
                  </Box>
                )}
              </Droppable>
            ))}
        </Flex>
      </Flex>
    </Box>
  )
}

export default RhymingCategoriesQuestion
