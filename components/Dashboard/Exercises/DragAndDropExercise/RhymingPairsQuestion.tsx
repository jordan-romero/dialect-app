// RhymingPairsQuestion.tsx
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
    } else if (selectedWords.length === 1) {
      const [firstWord] = selectedWords
      if (
        firstWord.rhymingWordId === word.id ||
        word.rhymingWordId === firstWord.id
      ) {
        setMatchedWords([...matchedWords, firstWord, word])
        setSelectedWords([])
      } else {
        setSelectedWords([...selectedWords, word])
      }
    } else {
      setSelectedWords([word])
    }
  }

  const isWordMatched = (word: AnswerOption) => {
    return matchedWords.includes(word)
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
      <Text fontWeight="bold">{question.text}</Text>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box width="45%">
          <Text fontWeight="bold" marginBottom={2}>
            Column 1
          </Text>
          {column1Words.map((word) => (
            <Button
              key={word.id}
              onClick={() => handleWordClick(word)}
              variant={
                selectedWords.includes(word) || isWordMatched(word)
                  ? 'solid'
                  : 'outline'
              }
              colorScheme={
                selectedWords.includes(word)
                  ? 'red'
                  : isWordMatched(word)
                  ? 'green'
                  : 'gray'
              }
              width="100%"
              marginBottom={2}
              onMouseDown={() => playAudio(word.audioUrl)}
            >
              {word.optionText}
            </Button>
          ))}
        </Box>
        <Box width="45%">
          <Text fontWeight="bold" marginBottom={2}>
            Column 2
          </Text>
          {column2Words.map((word) => (
            <Button
              key={word.id}
              onClick={() => handleWordClick(word)}
              variant={
                selectedWords.includes(word) || isWordMatched(word)
                  ? 'solid'
                  : 'outline'
              }
              colorScheme={
                selectedWords.includes(word)
                  ? 'red'
                  : isWordMatched(word)
                  ? 'green'
                  : 'gray'
              }
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
