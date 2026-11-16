import React, { useEffect } from 'react'
import { renderUnderlined } from '../UnderlineMarkup'
import { Box, Text, Flex } from '@chakra-ui/react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { Question, AnswerOption } from '../QuizTypes'
import { useToast } from '@chakra-ui/react'
import { Divider } from '@chakra-ui/react'
import { capitalizeFirstLetter } from './utils'
import Callout from '../Callout'
import InstructionsBox from '../InstructionsBox'
import { BankHeading, WORD_BANK_BUTTON } from '../bank'

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
      <Callout tone="prompt" label="Keep in mind" mt={0}>
        English spelling is incredibly inconsistent, as you will discover in
        this exercise.
      </Callout>
      <Box mt={4} mb={4}>
        <InstructionsBox>
          <b>{renderUnderlined(question.text)}</b>
        </InstructionsBox>
      </Box>
      <Flex flexDirection="column">
        <Box
          position="sticky"
          top="0"
          zIndex="1"
          bg="surface.card"
          borderBottom="1px solid"
          borderColor="border.subtle"
          pb={4}
        >
          <Box bg="surface.subtle" p={4} borderRadius="md">
            <BankHeading kind="word" />
            <Droppable droppableId="wordBank" direction="horizontal">
              {(provided) => (
                <Flex
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  minHeight="48px"
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
                          bg="surface.card"
                          {...WORD_BANK_BUTTON}
                          display="flex"
                          alignItems="center"
                          m={1}
                          boxShadow="md"
                          borderRadius="md"
                        >
                          {renderUnderlined(word.optionText)}
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Flex>
              )}
            </Droppable>
          </Box>
        </Box>
        <Flex flexWrap="wrap" justifyContent="space-between" mt={4}>
          {question.categories &&
            question.categories.map((category: string) => (
              <Droppable key={category} droppableId={category}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    bg="surface.subtle"
                    p={4}
                    width={['100%', '48%']}
                    mb={4}
                  >
                    <Text fontWeight="bold" mb={2}>
                      {/* The THOUGHT column collects the words that DON'T rhyme. */}
                      {category.toLowerCase() === 'thought' ? (
                        <>
                          Words that <u>do not rhyme</u> with “Thought”
                        </>
                      ) : (
                        capitalizeFirstLetter(category)
                      )}
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
                                {renderUnderlined(word.optionText)}
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
