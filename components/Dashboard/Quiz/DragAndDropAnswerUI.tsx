// DragAndDropQuiz.tsx
import React, { useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import { AnswerOption } from './QuizTypes'

interface DragAndDropQuizProps {
  answerOptions: AnswerOption[]
  onAnswerChange: (answeredWords: AnswerOption[]) => void
}

const DragAndDropQuiz: React.FC<DragAndDropQuizProps> = ({
  answerOptions,
  onAnswerChange,
}) => {
  const [rhymingWords, setRhymingWords] = useState<AnswerOption[]>([])
  const [answeredWords, setAnsweredWords] =
    useState<AnswerOption[]>(answerOptions)

  const handleDragEnd = (result: DropResult) => {
    // ... (drag and drop logic remains the same)
  }

  const playAudioClip = (word: AnswerOption) => {
    // ... (audio playback logic remains the same)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
                      onMouseDown={(event) => {
                        if (event.button === 0) {
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
                        rhymingWords[0].rhymingWordId === rhymingWords[1].id
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
    </DragDropContext>
  )
}

export default DragAndDropQuiz
