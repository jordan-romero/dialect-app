import React, { useState, useEffect } from 'react'
import { renderUnderlined } from './UnderlineMarkup'
import Callout from './Callout'
import {
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Icon,
  Link,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { MdKeyboard, MdPlayArrow } from 'react-icons/md'
import useQuiz from './utils'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { postQuizAnswers, fetchQuizProgress } from './quizApi'
import { useIpaKeyboard } from '../../Community/IpaKeyboardPip'

interface ShortAnswerQuizProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const UNCONNECTED_MARKER = ' — unconnected '
const CHALLENGE_PREFIX = 'Extra challenge:'

// "[label](https://…)" in authored text becomes a link opening in a new tab.
// The API presigns our S3 URLs inside the text before it gets here.
const renderLinks = (text: string): React.ReactNode =>
  text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    return m ? (
      <Link
        key={i}
        href={m[2]}
        isExternal
        color="brand.iris"
        textDecoration="underline"
        fontWeight="semibold"
      >
        {m[1]}
      </Link>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  })

// An answer's text may carry a note on the lines after it ("…|*" then
// "*Note: …"): the first line is the answer, the rest show as its footnote.
const splitAnswer = (text: string) => {
  const [answer, ...note] = text.split('\n')
  return { answer, footnote: note.join(' ').trim() || undefined }
}

// Prompts authored as "“Quote.” — <marker> /…/" show the quote, then the
// transcription the learner works from in a purple callout labelled here.
const PROMPT_MARKERS: Array<[string, string]> = [
  [UNCONNECTED_MARKER, 'Unconnected speech'],
  [' — GenAm ', 'GenAm transcription'],
]
const splitPrompt = (text: string) => {
  for (const [marker, label] of PROMPT_MARKERS) {
    const i = text.indexOf(marker)
    if (i !== -1)
      return {
        quote: text.slice(0, i),
        transcription: text.slice(i + marker.length),
        label,
      }
  }
  return null
}

const ShortAnswerQuiz: React.FC<ShortAnswerQuizProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<
    Record<number, Record<number, string>>
  >({})
  const [showSentence, setShowSentence] = useState(false)
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedOptionId, setFocusedOptionId] = useState<number | null>(null)
  const toast = useToast()
  const ipaKeyboard = useIpaKeyboard()

  const currentQuiz = quizzes[quizIndex]
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex]

  const isUnconnectedPrompt =
    currentQuestion?.text.includes(UNCONNECTED_MARKER) ?? false

  const revealSentenceOption = currentQuestion?.answerOptions.find(
    (option) => option.audioUrl,
  )

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentQuiz) return

      try {
        const data = await fetchQuizProgress(currentQuiz.id, lessonId)
        if (data) {
          setIsCompleted(data.isCompleted)

          // Restore saved answers
          if (data.answers.length > 0) {
            const savedAnswers: Record<number, Record<number, string>> = {}
            data.answers.forEach((answer) => {
              try {
                // each question's inputs are stored as a JSON map {optionId: text}
                savedAnswers[answer.questionId] = JSON.parse(answer.textAnswer)
              } catch {
                savedAnswers[answer.questionId] = {}
              }
            })
            setAnswers(savedAnswers)
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [currentQuiz, lessonId])

  useEffect(() => {
    setIsQuestionComplete(false)
    setShowSentence(false)
  }, [currentQuestion])

  // Auto-focus the first answer input when the question changes so the IPA
  // keyboard knows where to insert (and stays targeted as you advance).
  const firstInputRef = React.useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (isCompleted) return
    const t = setTimeout(
      () => firstInputRef.current?.focus({ preventScroll: true }),
      60,
    )
    return () => clearTimeout(t)
  }, [currentQuestionIndex, currentQuiz?.id, isCompleted])

  const handleAnswerChange = (
    questionId: number,
    answerId: number,
    value: string,
  ) => {
    // Once completed, responses are locked in place until "Try again".
    if (isCompleted) return
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: {
        ...prevAnswers[questionId],
        [answerId]: value,
      },
    }))
  }

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex === currentQuiz?.questions.length! - 1) {
      setIsQuestionComplete(true)
      await submitQuiz()
      onComplete()
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setShowSentence(false)
    }
  }

  const submitQuiz = async () => {
    if (!currentQuiz) return

    setIsLoading(true)
    try {
      // Store each question's inputs as ONE row — a JSON map of {optionId: text}
      // — so every response persists (UserAnswer is unique per question, so the
      // old one-row-per-input approach collapsed them all into one).
      const answersToSubmit = Object.entries(answers).map(
        ([questionId, questionAnswers]) => ({
          questionId: parseInt(questionId),
          textAnswer: JSON.stringify(questionAnswers),
        }),
      )

      const ok = await postQuizAnswers({
        quizId: currentQuiz.id,
        lessonId,
        answers: answersToSubmit,
      })

      if (ok) {
        setIsCompleted(true)
      } else {
        console.error('Failed to submit quiz')
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

  const allInputsFilled = currentQuestion?.answerOptions
    .filter((option) => !option.audioUrl)
    .every((option) => answers[currentQuestion.id]?.[option.id])

  const playAudio = (audioUrl: string | undefined) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const isNextDisabled = !(
    showSentence ||
    (allInputsFilled && !revealSentenceOption)
  )

  // Spell out what's still blocking the Next/Finish button. The gate is a
  // two-step chain on reveal questions (fill everything in, then reveal), and
  // a dead arrow with no explanation reads like a bug.
  const nextBlockedReason = !isNextDisabled
    ? undefined
    : !allInputsFilled
    ? 'Answer every prompt above to continue'
    : revealSentenceOption && !showSentence
    ? 'Reveal the sentence to continue'
    : undefined

  if (!currentQuiz) return <QuizSkeleton />

  return (
    <Box>
      {currentQuestion && (
        <Box>
          {/* Not every short-answer quiz carries wording; those that do have
              it authored in the content, so it isn't inferred here. */}
          {/* A paragraph starting "Extra challenge:" is shown as its own
              purple callout under the instructions. */}
          {currentQuiz?.instructions &&
            currentQuiz.instructions.split('\n\n').map((para, i) =>
              para.startsWith(CHALLENGE_PREFIX) ? (
                <Box key={i} mb={4}>
                  <Callout tone="prompt" label="Extra challenge" mt={0}>
                    {renderLinks(para.slice(CHALLENGE_PREFIX.length).trim())}
                  </Callout>
                </Box>
              ) : (
                <Text key={i} fontStyle="italic" mb={4}>
                  {i === 0 ? 'Instructions: ' : ''}
                  {para}
                </Text>
              ),
            )}
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              size="sm"
              variant="brandBold"
              leftIcon={<Icon as={MdKeyboard} />}
              onClick={ipaKeyboard.toggle}
            >
              {ipaKeyboard.isOpen ? 'Hide IPA Keyboard' : 'IPA Keyboard'}
            </Button>
          </Box>
          {(() => {
            // Descriptive Transcription ("— unconnected /…/") and Practice RP
            // Changes ("— GenAm /…/") prompts: the quote, then the
            // transcription to work from in a purple callout beneath.
            const prompt = splitPrompt(currentQuestion.text)
            if (!prompt) {
              return (
                <>
                  <Text fontSize="xl">
                    {renderUnderlined(currentQuestion.text)}
                  </Text>
                  {currentQuestion.audioUrl && (
                    <Button
                      onClick={() => playAudio(currentQuestion.audioUrl)}
                      mt={2}
                      mb={4}
                    >
                      Play Question Audio
                    </Button>
                  )}
                </>
              )
            }
            // The clip is what the learner transcribes, so its button sits
            // beside the sentence it speaks rather than below the IPA box.
            return (
              <>
                <HStack spacing={3} flexWrap="wrap">
                  <Text fontSize="xl" fontWeight="bold">
                    {renderUnderlined(prompt.quote)}
                  </Text>
                  {currentQuestion.audioUrl && (
                    <Button
                      size="sm"
                      leftIcon={<Icon as={MdPlayArrow} />}
                      onClick={() => playAudio(currentQuestion.audioUrl)}
                    >
                      Play Audio
                    </Button>
                  )}
                </HStack>
                <Callout tone="prompt" label={prompt.label} ipa>
                  {prompt.transcription}
                </Callout>
              </>
            )
          })()}
          <VStack spacing={4} mt={4} align="start">
            {currentQuestion.answerOptions
              .filter((option) => !option.audioUrl)
              .map((option, idx) => (
                <Box key={option.id} width="100%">
                  {/* When there's an audio "reveal sentence" option (e.g. the
                      "My Baby" exercise), the non-audio optionText is a prompt
                      and should always show. For answer-only reveal quizzes
                      (no audio option), optionText is the answer — hide it
                      until the learner clicks "Reveal Answer". */}
                  {revealSentenceOption && (
                    <Text mb={1}>{renderUnderlined(option.optionText)}</Text>
                  )}
                  <Input
                    ref={idx === 0 ? firstInputRef : undefined}
                    type="text"
                    data-ipa-field
                    className="ipa-text"
                    placeholder="Type your answer…"
                    value={answers[currentQuestion.id]?.[option.id] || ''}
                    onChange={(e) =>
                      handleAnswerChange(
                        currentQuestion.id,
                        option.id,
                        e.target.value,
                      )
                    }
                    onFocus={() => setFocusedOptionId(option.id)}
                    onBlur={() => setFocusedOptionId(null)}
                    isReadOnly={isCompleted}
                    width="100%"
                    marginBottom={2}
                  />
                  {/* Descriptive Transcription's task, restated where the
                      learner is typing so it's in view while they answer. */}
                  {isUnconnectedPrompt &&
                    focusedOptionId === option.id &&
                    !isCompleted && (
                      <Text mt={-1} fontSize="sm" color="gray.500">
                        Type out the connected speech version to match the
                        audio.
                      </Text>
                    )}
                  {!revealSentenceOption && showSentence && (
                    <Callout
                      tone="answer"
                      label="Answer"
                      ipa
                      mt={1}
                      footnote={splitAnswer(option.optionText).footnote}
                    >
                      {splitAnswer(option.optionText).answer}
                    </Callout>
                  )}
                </Box>
              ))}
          </VStack>
          {/* The learner commits an attempt before seeing the answer, the
              same rule Reveal Sentence follows below. */}
          {!revealSentenceOption && (
            <Tooltip
              label="Type your answer above to reveal it"
              isDisabled={allInputsFilled || showSentence}
              shouldWrapChildren
              hasArrow
            >
              <Button
                onClick={() => setShowSentence(true)}
                mt={4}
                variant="brandWhite"
                isDisabled={showSentence || !allInputsFilled}
              >
                Reveal Answer
              </Button>
            </Tooltip>
          )}
          {showSentence && revealSentenceOption && (
            <Box mt={4}>
              <Callout tone="answer" label="Answer" mt={0}>
                {renderUnderlined(revealSentenceOption.optionText)}
              </Callout>
              <Button
                onClick={() => playAudio(revealSentenceOption.audioUrl)}
                mt={2}
              >
                Play Sentence Audio
              </Button>
            </Box>
          )}
          {!showSentence && revealSentenceOption && (
            <Tooltip
              label="Answer every prompt above to reveal the sentence"
              isDisabled={allInputsFilled}
              shouldWrapChildren
              hasArrow
            >
              <Button
                onClick={() => setShowSentence(true)}
                mt={4}
                variant="brandWhite"
                isDisabled={!allInputsFilled}
              >
                Reveal Sentence
              </Button>
            </Tooltip>
          )}
        </Box>
      )}
      {currentQuiz && currentQuiz.questions && (
        <QuizNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={currentQuiz.questions.length}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onFinish={handleNextQuestion}
          isNextDisabled={isNextDisabled || isLoading}
          isCompleted={isCompleted}
          disabledReason={nextBlockedReason}
        />
      )}
    </Box>
  )
}

export default ShortAnswerQuiz
