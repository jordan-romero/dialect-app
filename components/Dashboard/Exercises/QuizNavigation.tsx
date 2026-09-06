import React from 'react'
import { Flex, IconButton, Text, Icon, Tooltip } from '@chakra-ui/react'
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon } from '@chakra-ui/icons'
import { MdCheckCircle } from 'react-icons/md'

interface QuizNavigationProps {
  currentQuestion: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onFinish: () => void
  isNextDisabled: boolean
  /**
   * When the quiz is completed, navigation is unlocked so the learner can page
   * back and forth to review their answers. While it's NOT completed, forward
   * navigation stays gated by `isNextDisabled` (they must finish the current
   * step before moving on).
   */
  isCompleted?: boolean
  /**
   * Shown on hover/focus when forward navigation is blocked, so the learner
   * can see what's still required instead of guessing at a dead button.
   */
  disabledReason?: string
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onFinish,
  isNextDisabled,
  isCompleted = false,
  disabledReason,
}) => {
  const isFirstQuestion = currentQuestion === 1
  const isLastQuestion = currentQuestion === totalQuestions
  // Completed → free review navigation; otherwise honor the gate.
  const nextDisabled = isCompleted ? false : isNextDisabled
  // Chakra needs shouldWrapChildren to surface a tooltip on a disabled
  // control (disabled elements don't emit pointer events themselves).
  const hint = nextDisabled ? disabledReason ?? '' : ''

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

      {isLastQuestion && isCompleted ? (
        <Flex
          align="center"
          gap={2}
          bg="green.500"
          color="white"
          px={4}
          py={2}
          borderRadius="full"
          fontWeight="bold"
          fontSize="sm"
        >
          <Icon as={MdCheckCircle} boxSize={5} />
          Completed
        </Flex>
      ) : isLastQuestion ? (
        <Tooltip label={hint} isDisabled={!hint} shouldWrapChildren hasArrow>
          <IconButton
            aria-label="Finish quiz"
            icon={<CheckIcon />}
            onClick={onFinish}
            isDisabled={nextDisabled}
            variant="brandBold"
          />
        </Tooltip>
      ) : (
        <Tooltip label={hint} isDisabled={!hint} shouldWrapChildren hasArrow>
          <IconButton
            aria-label="Next question"
            icon={<ArrowRightIcon />}
            onClick={onNext}
            isDisabled={nextDisabled}
            variant="brandBold"
          />
        </Tooltip>
      )}
    </Flex>
  )
}

export default QuizNavigation
