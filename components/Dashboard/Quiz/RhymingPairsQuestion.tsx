// RhymingPairsQuestion.tsx
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Question, AnswerOption } from './QuizTypes'

interface RhymingPairsQuestionProps {
  question: Question
  rhymingWords: AnswerOption[]
  answeredWords: AnswerOption[]
  playAudio: (audioUrl: string) => void
}

const RhymingPairsQuestion: React.FC<RhymingPairsQuestionProps> = ({
  question,
  rhymingWords,
  answeredWords,
  playAudio,
}) => {
  const isWordMatched = (word: AnswerOption, rhymingWords: AnswerOption[]) => {
    return rhymingWords.some(
      (rhymingWord) => word.rhymingWordId === rhymingWord.id,
    )
  }

  return (
    <VStack spacing={8}>
      <Text fontWeight="bold">{question.text}</Text>
      <Box display="flex" justifyContent="space-between" width="100%">
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
                      onMouseDown={() => playAudio(word.audioUrl)}
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
                        isWordMatched(word, rhymingWords)
                          ? 'green.100'
                          : 'red.100'
                      }
                      color={
                        isWordMatched(word, rhymingWords)
                          ? 'green.800'
                          : 'red.800'
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
    </VStack>
  )
}

export default RhymingPairsQuestion
