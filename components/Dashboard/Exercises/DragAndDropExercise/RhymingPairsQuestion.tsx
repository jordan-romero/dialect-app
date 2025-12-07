import React, { useState, useEffect, useCallback } from 'react'
import { Box, Text, VStack, Button } from '@chakra-ui/react'
import { Question, AnswerOption } from '../QuizTypes'

interface RhymingPairsQuestionProps {
  question: Question
  playAudio: (audioUrl: string) => void
  onQuestionComplete: () => void
}

const RhymingPairsQuestion: React.FC<RhymingPairsQuestionProps> = ({
  question,
  playAudio,
  onQuestionComplete,
}) => {
  const [selectedWords, setSelectedWords] = useState<AnswerOption[]>([])
  const [matchedWords, setMatchedWords] = useState<AnswerOption[]>([])
  const [incorrectPair, setIncorrectPair] = useState<AnswerOption[]>([])

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

  const column1Words: AnswerOption[] = []
  const column2Words: AnswerOption[] = []

  question.answerOptions.forEach((word) => {
    if (!word.rhymingWordId) {
      // Words without a match
      if (column1Words.length <= column2Words.length) {
        column1Words.push(word)
      } else {
        column2Words.push(word)
      }
    } else {
      // Words with a match
      const rhymingWord = question.answerOptions.find(
        (option) => option.id === word.rhymingWordId,
      )
      if (
        rhymingWord &&
        !column1Words.includes(rhymingWord) &&
        !column2Words.includes(word)
      ) {
        column1Words.push(word)
        column2Words.push(rhymingWord)
      }
    }
  })

  return (
    <VStack spacing={8}>
      <Box>
        <Text>
          <b>Instructions:</b>
          English spelling is incredibly inconsistent, as you will discover in
          this exercise.
          <b>{question.text}</b>
          Be careful, some words do not have a rhyming partner.
        </Text>
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
              {word.optionText}
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
