import React from 'react'
import { Flex, IconButton, Text } from '@chakra-ui/react'
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon } from '@chakra-ui/icons'

interface QuizNavigationProps {
  currentQuestion: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onFinish: () => void
  isNextDisabled: boolean
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onFinish,
  isNextDisabled,
}) => {
  const isFirstQuestion = currentQuestion === 1
  const isLastQuestion = currentQuestion === totalQuestions

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      mt={4}
    >
      <IconButton
        aria-label="Previous question"
        icon={<ArrowLeftIcon />}
        onClick={onPrevious}
        isDisabled={isFirstQuestion}
        variant="brandGhost"
      />

      <Text fontWeight="bold">
        {currentQuestion} / {totalQuestions}
      </Text>

      {isLastQuestion ? (
        <IconButton
          aria-label="Finish quiz"
          icon={<CheckIcon />}
          onClick={onFinish}
          isDisabled={isNextDisabled}
          variant="brandBold"
        />
      ) : (
        <IconButton
          aria-label="Next question"
          icon={<ArrowRightIcon />}
          onClick={onNext}
          isDisabled={isNextDisabled}
          variant="brandBold"
        />
      )}
    </Flex>
  )
}

export default QuizNavigation
