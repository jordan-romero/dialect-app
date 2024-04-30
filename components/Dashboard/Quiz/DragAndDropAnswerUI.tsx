import React from 'react'
import { Box, Text, Table, Tbody, Tr, Td } from '@chakra-ui/react'
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
  // Render table cells in 2 columns
  const renderTableRows = () => {
    let rows = []
    for (let i = 0; i < question.answerOptions.length; i += 2) {
      let cells = []

      for (let j = i; j < i + 2; j++) {
        const option = question.answerOptions[j]

        if (option) {
          const isAdjacentRhyme =
            j > 0 &&
            selectedOptions.includes(option.id) &&
            selectedOptions.includes(question.answerOptions[j - 1].id) &&
            isRhyming(question.id, question.answerOptions[j - 1].id, option.id)

          cells.push(
            <Td key={option.id} width="50%">
              <Draggable draggableId={`option-${option.id}`} index={i}>
                {(provided, snapshot) => (
                  <React.Fragment>
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      bg={isAdjacentRhyme ? 'green.500' : 'gray.100'}
                      color={isAdjacentRhyme ? 'white' : 'inherit'}
                      p={2}
                      borderRadius="md"
                      boxShadow="md"
                      onMouseEnter={() => onOptionClick(option.id)}
                      cursor="pointer"
                      minHeight="40px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      width="100%"
                      // Apply a transform if the item is being dragged
                      transform={snapshot.isDragging ? 'rotate(5deg)' : 'none'}
                      transition="transform 0.2s ease"
                    >
                      {option.optionText}
                    </Box>
                    {snapshot.isDragging && (
                      <Box
                        height="40px" // Adjust based on the height of your draggable items
                        width="100%"
                        margin="8px 0" // Match vertical margins if any
                      />
                    )}
                  </React.Fragment>
                )}
              </Draggable>
            </Td>,
          )
        } else {
          cells.push(<Td key={`empty-${j}`} width="50%" />)
        }
      }

      // Push the row of two cells
      rows.push(<Tr key={`row-${i}`}>{cells}</Tr>)
    }

    return rows
  }

  return (
    <Box width="100%">
      <Text mb={4}>{question.text}</Text>
      <Droppable droppableId={`options-${question.id}`} direction="horizontal">
        {(provided, snapshot) => (
          <Table
            ref={provided.innerRef}
            {...provided.droppableProps}
            width="100%"
            variant="simple"
          >
            <Tbody>{renderTableRows()}</Tbody>
            {provided.placeholder}
          </Table>
        )}
      </Droppable>
    </Box>
  )
}

export default DragAndDropAnswerUI
