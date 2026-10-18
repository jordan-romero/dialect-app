import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Text, Wrap, WrapItem, useToast } from '@chakra-ui/react'
import useQuiz from './utils'
import { AnswerOption } from './QuizTypes'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { shuffleArray } from './shuffle'
import { postQuizAnswers, fetchQuizProgress } from './quizApi'

// 10B Syllabic Stress: Noun vs. Verb. Each question is one sentence with a
// blank per stress pattern of the same word, authored as
// "Address — “We will ___ the crowd at this ___.”". Its answer options are the
// transcriptions in blank order (the API returns them sorted by id), so the
// option at index i is the one that belongs in blank i.

const BLANK = '___'
const WORD_MARKER = ' — '

type Placement = (number | null)[]

interface StressPlacementProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const StressPlacementExercise: React.FC<StressPlacementProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const quiz = useMemo(
    () => quizzes?.find((q) => q.order === quizIndex),
    [quizzes, quizIndex],
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [placements, setPlacements] = useState<Record<number, Placement>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const question = quiz?.questions[questionIndex]

  // Options come back in answer order, which would give the answer away.
  const optionsSignature = (quiz?.questions ?? [])
    .map((q) => q.answerOptions.map((o) => o.id).join(','))
    .join('|')
  const shuffledByQuestion = useMemo(() => {
    const out: Record<number, AnswerOption[]> = {}
    ;(quiz?.questions ?? []).forEach((q) => {
      out[q.id] = shuffleArray(q.answerOptions)
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsSignature])

  useEffect(() => {
    if (!quiz) return
    fetchQuizProgress(quiz.id, lessonId)
      .then((data) => {
        if (!data) return
        setIsCompleted(data.isCompleted)
        const restored: Record<number, Placement> = {}
        const restoredChecked: Record<number, boolean> = {}
        data.answers.forEach((a) => {
          try {
            const parsed = JSON.parse(a.textAnswer)
            if (Array.isArray(parsed)) {
              restored[a.questionId] = parsed
              restoredChecked[a.questionId] = true
            }
          } catch {
            // Answers saved before this became a placement exercise aren't
            // arrays; leave those questions empty.
          }
        })
        // Saved answers fill in around this session's, never over them: a
        // refetch mid-quiz used to wipe placements, and the submit then
        // missed questions and was rejected.
        setPlacements((prev) => ({ ...restored, ...prev }))
        setChecked((prev) => ({ ...restoredChecked, ...prev }))
      })
      .catch((error) => console.error('Error loading quiz progress:', error))
    // Keyed on the id: the quiz object is rebuilt on every quizzes refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id, lessonId])

  if (!quiz || !question) return <QuizSkeleton />

  const [word, sentence] = question.text.includes(WORD_MARKER)
    ? question.text.split(WORD_MARKER)
    : [undefined, question.text]
  const parts = sentence.split(BLANK)
  const blankCount = parts.length - 1
  const placement: Placement =
    placements[question.id] ?? Array(blankCount).fill(null)
  const isChecked = !!checked[question.id] || isCompleted
  const isLocked = isChecked
  const allFilled = placement.length === blankCount && placement.every((id) => id !== null)
  const optionById = (id: number | null) =>
    question.answerOptions.find((o) => o.id === id)
  const isBlankCorrect = (i: number) =>
    placement[i] === question.answerOptions[i]?.id
  const isQuestionCorrect = allFilled && placement.every((_, i) => isBlankCorrect(i))
  const bank = (shuffledByQuestion[question.id] ?? []).filter(
    (o) => !placement.includes(o.id),
  )

  const setPlacement = (next: Placement) =>
    setPlacements((prev) => ({ ...prev, [question.id]: next }))

  const placeOption = (optionId: number) => {
    if (isLocked) return
    const slot = placement.indexOf(null)
    if (slot === -1) return
    const next = [...placement]
    next[slot] = optionId
    setPlacement(next)
  }

  const clearBlank = (i: number) => {
    if (isLocked || placement[i] === null) return
    const next = [...placement]
    next[i] = null
    setPlacement(next)
  }

  const retry = () => {
    setPlacement(Array(blankCount).fill(null))
    setChecked((prev) => ({ ...prev, [question.id]: false }))
  }

  const submitQuiz = async () => {
    setIsLoading(true)
    try {
      const ok = await postQuizAnswers({
        quizId: quiz.id,
        lessonId,
        answers: Object.entries(placements).map(([questionId, p]) => ({
          questionId: parseInt(questionId),
          textAnswer: JSON.stringify(p),
        })),
      })
      if (ok) {
        setIsCompleted(true)
        onComplete()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save your answers. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (questionIndex === quiz.questions.length - 1) {
      if (!isCompleted) await submitQuiz()
    } else {
      setQuestionIndex((i) => i + 1)
    }
  }

  return (
    <Box>
      {quiz.instructions && (
        <Text fontStyle="italic" mb={4}>
          Instructions: {quiz.instructions}
        </Text>
      )}
      {word && (
        <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color="brand.iris" mb={2}>
          {word}
        </Text>
      )}
      <Text fontSize="xl" fontWeight="bold" lineHeight="tall">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < blankCount && (
              <Button
                as="span"
                role="button"
                mx={1}
                minW="7rem"
                size="md"
                className="ipa-text"
                fontSize="lg"
                variant="outline"
                borderStyle={placement[i] === null ? 'dashed' : 'solid'}
                colorScheme={
                  isChecked ? (isBlankCorrect(i) ? 'green' : 'red') : 'purple'
                }
                cursor={isLocked || placement[i] === null ? 'default' : 'pointer'}
                onClick={() => clearBlank(i)}
                aria-label={
                  placement[i] === null
                    ? `Blank ${i + 1}, empty`
                    : `Blank ${i + 1}: ${optionById(placement[i])?.optionText}. Tap to remove`
                }
              >
                {optionById(placement[i])?.optionText ?? ' '}
              </Button>
            )}
          </React.Fragment>
        ))}
      </Text>

      {!isLocked && (
        <Wrap spacing={3} mt={6}>
          {bank.map((option) => (
            <WrapItem key={option.id}>
              <Button
                className="ipa-text"
                fontSize="lg"
                variant="brandWhite"
                onClick={() => placeOption(option.id)}
              >
                {option.optionText}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {!isLocked && (
        <Button
          mt={6}
          variant="brandBold"
          isDisabled={!allFilled}
          onClick={() =>
            setChecked((prev) => ({ ...prev, [question.id]: true }))
          }
        >
          Check Answer
        </Button>
      )}

      {isChecked && allFilled && (
        <Flex mt={6} direction="column" gap={1}>
          <Text fontWeight="bold" color={isQuestionCorrect ? 'green.600' : 'red.600'}>
            {isQuestionCorrect ? 'Correct!' : 'Not quite.'}
          </Text>
          {/* A wrong answer stays on screen until the learner chooses to
              retry; the answer itself only shows once the quiz is done. */}
          {!isQuestionCorrect && !isCompleted && (
            <Button
              alignSelf="flex-start"
              mt={2}
              variant="brandBold"
              onClick={retry}
            >
              Retry
            </Button>
          )}
          {!isQuestionCorrect && isCompleted && (
            <Text>
              Correct order:{' '}
              <Text as="span" className="ipa-text">
                {question.answerOptions.map((o) => o.optionText).join(' … ')}
              </Text>
            </Text>
          )}
        </Flex>
      )}

      <QuizNavigation
        currentQuestion={questionIndex + 1}
        totalQuestions={quiz.questions.length}
        onPrevious={() => setQuestionIndex((i) => Math.max(0, i - 1))}
        onNext={handleNext}
        onFinish={handleNext}
        isNextDisabled={!(isChecked && isQuestionCorrect) || isLoading}
        isCompleted={isCompleted}
        disabledReason={
          isChecked
            ? isQuestionCorrect
              ? undefined
              : 'Retry to get this one right before continuing'
            : allFilled
            ? 'Check your answer to continue'
            : 'Fill both blanks to continue'
        }
      />
    </Box>
  )
}

export default StressPlacementExercise
