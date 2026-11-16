import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { renderUnderlined } from '../UnderlineMarkup'
import { Box, Text, VStack, Button } from '@chakra-ui/react'
import { Question, AnswerOption } from '../QuizTypes'
import { shuffleArray } from '../shuffle'
import Callout from '../Callout'
import InstructionsBox from '../InstructionsBox'

interface RhymingPairsQuestionProps {
  question: Question
  playAudio: (audioUrl: string) => void
  onQuestionComplete: () => void
  /** Restore previously matched word ids (e.g. a completed quiz). */
  initialMatchedIds?: number[]
  /** When true, the board is read-only (answers locked until "Try again"). */
  locked?: boolean
  /** Report the current matched word ids so the parent can persist them. */
  onMatchedChange?: (matchedIds: number[]) => void
}

const RhymingPairsQuestion: React.FC<RhymingPairsQuestionProps> = ({
  question,
  playAudio,
  onQuestionComplete,
  initialMatchedIds,
  locked = false,
  onMatchedChange,
}) => {
  const [selectedWords, setSelectedWords] = useState<AnswerOption[]>([])
  const [matchedWords, setMatchedWords] = useState<AnswerOption[]>([])
  const [incorrectPair, setIncorrectPair] = useState<AnswerOption[]>([])

  // Restore matched words from saved ids (keeps a completed board in place).
  useEffect(() => {
    if (!initialMatchedIds || initialMatchedIds.length === 0) return
    const restored = initialMatchedIds
      .map((id) => question.answerOptions.find((o) => o.id === id))
      .filter((o): o is AnswerOption => Boolean(o))
    setMatchedWords(restored)
  }, [initialMatchedIds, question.answerOptions])

  // Report matches up so the parent can persist them.
  useEffect(() => {
    onMatchedChange?.(matchedWords.map((w) => w.id))
  }, [matchedWords, onMatchedChange])

  const isQuizComplete = useCallback(() => {
    const wordsWithoutMatch = question.answerOptions.filter(
      (option) => !option.rhymingWordId,
    )
    return (
      matchedWords.length ===
      question.answerOptions.length - wordsWithoutMatch.length
    )
  }, [question.answerOptions, matchedWords])

  useEffect(() => {
    if (isQuizComplete()) {
      onQuestionComplete()
    }
  }, [isQuizComplete, matchedWords, onQuestionComplete])

  const handleWordClick = (word: AnswerOption) => {
    if (locked) return
    if (selectedWords.length === 0) {
      setSelectedWords([word])
      setIncorrectPair([])
    } else if (selectedWords.length === 1) {
      const [firstWord] = selectedWords
      if (
        firstWord.rhymingWordId === word.id ||
        word.rhymingWordId === firstWord.id
      ) {
        setMatchedWords([...matchedWords, firstWord, word])
        setSelectedWords([])
        setIncorrectPair([])
      } else {
        setIncorrectPair([firstWord, word])
        setSelectedWords([])
      }
    } else {
      setSelectedWords([word])
      setIncorrectPair([])
    }
  }

  const getButtonColorScheme = (word: AnswerOption) => {
    if (matchedWords.includes(word)) {
      return 'green'
    }
    if (incorrectPair.includes(word)) {
      return 'red'
    }
    if (selectedWords.includes(word)) {
      return 'blue'
    }
    return 'gray'
  }

  const pairedColumn1: AnswerOption[] = []
  const pairedColumn2: AnswerOption[] = []

  question.answerOptions.forEach((word) => {
    if (!word.rhymingWordId) {
      // Words without a match
      if (pairedColumn1.length <= pairedColumn2.length) {
        pairedColumn1.push(word)
      } else {
        pairedColumn2.push(word)
      }
    } else {
      // Words with a match
      const rhymingWord = question.answerOptions.find(
        (option) => option.id === word.rhymingWordId,
      )
      if (
        rhymingWord &&
        !pairedColumn1.includes(rhymingWord) &&
        !pairedColumn2.includes(word)
      ) {
        pairedColumn1.push(word)
        pairedColumn2.push(rhymingWord)
      }
    }
  })

  // Column 1 holds one word of each pair and column 2 the other (plus one
  // word with no partner on each side). Each column is shuffled on its own,
  // and column 2 is re-rolled until no word sits across from its partner, so
  // the layout never gives a match away. The order is memoised on the word
  // ids so nothing moves mid-click; words are looked up fresh so a refetch
  // never leaves stale objects on screen.
  const ids1 = pairedColumn1.map((w) => w.id)
  const ids2 = pairedColumn2.map((w) => w.id)
  const signature = `${ids1.join(',')}|${ids2.join(',')}`
  const order = useMemo(() => {
    const partnerOf = new Map(
      question.answerOptions.map((o) => [o.id, o.rhymingWordId]),
    )
    const col1 = shuffleArray(ids1)
    let col2 = shuffleArray(ids2)
    for (let tries = 0; tries < 50; tries++) {
      if (col2.every((id, i) => partnerOf.get(col1[i]) !== id)) break
      col2 = shuffleArray(ids2)
    }
    return { col1, col2 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
  const byId = new Map(question.answerOptions.map((o) => [o.id, o]))
  const inOrder = (ids: number[]) =>
    ids.map((id) => byId.get(id)).filter((o): o is AnswerOption => Boolean(o))
  const column1Words = inOrder(order.col1)
  const column2Words = inOrder(order.col2)

  return (
    <VStack spacing={8}>
      <Box>
        <Callout tone="prompt" label="Keep in mind" mt={0}>
          English spelling is incredibly inconsistent, as you will discover in
          this exercise.
        </Callout>
        <Box mt={4}>
          <InstructionsBox>
            <b>{renderUnderlined(question.text)}</b>{' '}
            <i>Be careful, some words do not have a rhyming partner.</i>
          </InstructionsBox>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box width="45%">
          <Text marginBottom={2}>Column 1</Text>
          {column1Words.map((word) => (
            <Button
              key={word.id}
              onClick={() => handleWordClick(word)}
              variant={
                selectedWords.includes(word) ||
                matchedWords.includes(word) ||
                incorrectPair.includes(word)
                  ? 'solid'
                  : 'outline'
              }
              colorScheme={getButtonColorScheme(word)}
              width="100%"
              marginBottom={2}
              onMouseDown={() => playAudio(word.audioUrl)}
            >
              {renderUnderlined(word.optionText)}
            </Button>
          ))}
        </Box>
        <Box width="45%">
          <Text marginBottom={2}>Column 2</Text>
          {column2Words.map((word) => (
            <Button
              key={word.id}
              onClick={() => handleWordClick(word)}
              variant={
                selectedWords.includes(word) ||
                matchedWords.includes(word) ||
                incorrectPair.includes(word)
                  ? 'solid'
                  : 'outline'
              }
              colorScheme={getButtonColorScheme(word)}
              width="100%"
              marginBottom={2}
              onMouseDown={() => playAudio(word.audioUrl)}
            >
              {word.optionText}
            </Button>
          ))}
        </Box>
      </Box>
    </VStack>
  )
}

export default RhymingPairsQuestion
