import React, { useEffect } from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Question, AnswerOption } from '../QuizTypes'
import { useToast } from '@chakra-ui/react'
import { Divider } from '@chakra-ui/react'
import { capitalizeFirstLetter } from './utils'

interface RhymingCategoriesQuestionProps {
  question: Question
  categories: { [key: string]: AnswerOption[] }
  wordBank: AnswerOption[]
  playAudio: (audioUrl: string) => void
  onQuestionStatusChange: (isComplete: boolean) => void
}

const RhymingCategoriesQuestion: React.FC<RhymingCategoriesQuestionProps> = ({
  question,
  categories,
  wordBank,
  playAudio,
  onQuestionStatusChange,
}) => {
  const isWordCorrect = (word: AnswerOption, category: string) => {
    if (category.toLowerCase() === 'thought') {
      // For 'thought' category, words that don't rhyme with 'thought' are correct
      return word.rhymeCategory !== 'thought'
    }
    // For all other categories, use the normal rhyming logic
    return word.rhymeCategory === category
  }

  useEffect(() => {
    const allWordsCorrect = Object.entries(categories).every(
      ([category, words]) =>
        words.every((word) => isWordCorrect(word, category)),
    )
    const allWordsPlaced = wordBank.length === 0
    onQuestionStatusChange(allWordsCorrect && allWordsPlaced)
  }, [categories, wordBank, onQuestionStatusChange])

  return (
    <Box>
      <Text>
        <b>Instructions:</b>
        English spelling is incredibly inconsistent, as you will discover in
        this exercise.
        <b>{question.text}</b>
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
                      {capitalizeFirstLetter(category)}
                    </Text>
                    <Divider borderColor="brand.purple" mb={4} />
                    <Flex flexDirection="column" minHeight="200px">
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
