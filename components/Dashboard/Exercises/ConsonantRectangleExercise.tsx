import React, { useState, useEffect, useMemo } from 'react'
import { useShuffledBank } from './shuffle'
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'

interface Slot {
  id: string
  manner: string
  place: string
  voicing: 'voiceless' | 'voiced'
  symbol: string
}
interface SpecialSlot {
  id: string
  label: string
  symbol: string
}
interface ConsonantRectData {
  id: number
  lessonId: number
  quizType: string
  questions: Array<{ id: number; text: string }>
  places: string[]
  manners: string[]
  slots: Slot[]
  specialSlots: SpecialSlot[]
  symbolBank: string[]
  mannerDefinitions: Record<string, string>
  placeDefinitions: Record<string, string>
}

interface Props {
  lessonId: number
  quizIndex: number
  onComplete: () => void
  onAllCorrectChange?: (allCorrect: boolean) => void
}

/** The dashed grid rule, applied to every body cell so the lines are continuous. */
const gridCell = {
  borderWidth: '1px',
  borderStyle: 'dashed',
  borderColor: 'purple.200',
} as const

const Cell: React.FC<{
  slots: Slot[]
  placements: Record<string, string>
  selectedSymbol: string | null
  onPlace: (slotId: string) => void
}> = ({ slots, placements, selectedSymbol, onPlace }) => {
  // Cells with no possible articulation. Same dashed rule as every other cell
  // so the grid reads as one continuous table rather than only appearing
  // around the shaded regions.
  if (slots.length === 0) return <Td bg="purple.50" {...gridCell} />
  return (
    <Td p={1} {...gridCell}>
      <Flex gap={1} justify="center">
        {slots
          .sort((a, b) => (a.voicing === 'voiceless' ? -1 : 1))
          .map((slot) => {
            const placed = placements[slot.id]
            const isCorrect = placed === slot.symbol
            const isWrong = placed && placed !== slot.symbol
            return (
              <Box
                key={slot.id}
                as="button"
                w="38px"
                h="38px"
                borderWidth="2px"
                borderRadius="md"
                fontFamily="ipa"
                fontSize="lg"
                fontWeight="semibold"
                title={slot.voicing}
                borderColor={
                  isCorrect
                    ? 'green.500'
                    : isWrong
                    ? 'red.500'
                    : selectedSymbol
                    ? 'teal.400'
                    : 'gray.300'
                }
                bg={isCorrect ? 'green.50' : isWrong ? 'red.50' : 'white'}
                onClick={() => onPlace(slot.id)}
              >
                {placed || ''}
              </Box>
            )
          })}
      </Flex>
    </Td>
  )
}

export const ConsonantRectangleExercise: React.FC<Props> = ({
  lessonId,
  onComplete,
  onAllCorrectChange,
}) => {
  const [data, setData] = useState<ConsonantRectData | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  // The bank is authored in grid order, which telegraphs the answers.
  const shuffledBank = useShuffledBank(data?.symbolBank)
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/consonantRectangleData.json')
      .then((r) => r.json())
      .then((d: ConsonantRectData) => setData(d))
      .catch((e) => console.error('Error loading consonant rectangle:', e))
  }, [])

  useEffect(() => {
    if (!data) return
    fetch(`/api/userQuizProgress?quizId=${data.id}&lessonId=${lessonId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setIsCompleted(d.isCompleted)
        const saved = d.answers?.find(
          (a: any) => a.questionId === data.questions[0]?.id,
        )
        if (saved?.textAnswer && saved.textAnswer !== 'pending') {
          try {
            setPlacements(JSON.parse(saved.textAnswer))
          } catch {
            /* keep empty */
          }
        }
      })
      .catch((e) => console.error('Error loading progress:', e))
  }, [data, lessonId])

  // index slots by manner+place for grid rendering
  const cellMap = useMemo(() => {
    const m: Record<string, Slot[]> = {}
    data?.slots.forEach((s) => {
      const key = `${s.manner}|${s.place}`
      ;(m[key] = m[key] || []).push(s)
    })
    return m
  }, [data])

  const allCorrect = useMemo(() => {
    if (!data) return false
    const every = [...data.slots, ...data.specialSlots]
    return every.every((s) => placements[s.id] === s.symbol)
  }, [data, placements])

  useEffect(() => {
    onAllCorrectChange?.(allCorrect)
  }, [allCorrect, onAllCorrectChange])

  const placeSymbol = (slotId: string) => {
    // Once completed, placements are locked until "Try again".
    if (isCompleted) return
    if (selectedSymbol) {
      setPlacements((p) => ({ ...p, [slotId]: selectedSymbol }))
      setSelectedSymbol(null)
    } else {
      // clear if already filled
      setPlacements((p) => {
        const next = { ...p }
        delete next[slotId]
        return next
      })
    }
  }

  const handleFinish = async () => {
    if (!data) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: data.id,
          lessonId,
          answers: data.questions.map((q) => ({
            questionId: q.id,
            textAnswer: JSON.stringify(placements),
          })),
        }),
      })
      if (res.ok) setIsCompleted(true)
    } catch (e) {
      console.error('Error submitting consonant rectangle:', e)
    } finally {
      setIsLoading(false)
    }
    onComplete()
  }

  if (!data) return <QuizSkeleton />

  return (
    <VStack spacing={5} align="stretch">
      <Text fontSize="lg" fontWeight="bold">
        {data.questions[0]?.text}
      </Text>
      <Box
        bg="gray.50"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm">
          <b>Instructions:</b> Click a symbol from the bank, then click the
          correct cell of the rectangle to place it (voiceless on the left,
          voiced on the right). Click a filled cell with nothing selected to
          clear it. Hover the row and column headers for definitions.
        </Text>
      </Box>

      {/* Symbol bank */}
      <Wrap spacing={2}>
        {shuffledBank.map((sym) => {
          const used = Object.values(placements).includes(sym)
          return (
            <WrapItem key={sym}>
              <Button
                size="sm"
                fontFamily="ipa"
                fontSize="lg"
                variant={selectedSymbol === sym ? 'solid' : 'outline'}
                colorScheme={selectedSymbol === sym ? 'teal' : 'gray'}
                opacity={used ? 0.4 : 1}
                onClick={() => setSelectedSymbol(sym)}
              >
                {sym}
              </Button>
            </WrapItem>
          )
        })}
      </Wrap>

      {/* Grid */}
      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th />
              {data.places.map((p) => (
                <Th key={p} textAlign="center">
                  <Tooltip label={data.placeDefinitions[p]} hasArrow>
                    <Text as="span" cursor="help">
                      {p}
                    </Text>
                  </Tooltip>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.manners.map((manner) => (
              <Tr key={manner}>
                <Th whiteSpace="nowrap" {...gridCell}>
                  <Tooltip label={data.mannerDefinitions[manner]} hasArrow>
                    <Text as="span" cursor="help">
                      {manner}
                    </Text>
                  </Tooltip>
                </Th>
                {data.places.map((place) => (
                  <Cell
                    key={`${manner}|${place}`}
                    slots={cellMap[`${manner}|${place}`] || []}
                    placements={placements}
                    selectedSymbol={selectedSymbol}
                    onPlace={placeSymbol}
                  />
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Special articulations */}
      <Box>
        <Text fontWeight="bold" mb={2}>
          Special Articulations
        </Text>
        {/* Laid out on the same dashed grid as the rectangle above, capped in
            width so the box sits beside its label rather than at the page edge.
            The -1px pulls each row onto the previous row's border so the
            horizontal rules don't double up. */}
        <VStack align="stretch" spacing={0} maxW="440px">
          {data.specialSlots.map((slot, i) => {
            const placed = placements[slot.id]
            const isCorrect = placed === slot.symbol
            const isWrong = placed && placed !== slot.symbol
            return (
              <Flex
                key={slot.id}
                align="center"
                {...gridCell}
                mt={i === 0 ? 0 : '-1px'}
              >
                <Text flex="1" px={3} py={2}>
                  {slot.label}:
                </Text>
                <Flex
                  align="center"
                  justify="center"
                  px={2}
                  py={1}
                  alignSelf="stretch"
                  borderLeftWidth="1px"
                  borderLeftStyle="dashed"
                  borderLeftColor="purple.200"
                >
                  <Box
                    as="button"
                    w="38px"
                    h="38px"
                    borderWidth="2px"
                    borderRadius="md"
                    fontFamily="ipa"
                    fontSize="lg"
                    fontWeight="semibold"
                    borderColor={
                      isCorrect
                        ? 'green.500'
                        : isWrong
                        ? 'red.500'
                        : selectedSymbol
                        ? 'teal.400'
                        : 'gray.300'
                    }
                    bg={isCorrect ? 'green.50' : isWrong ? 'red.50' : 'white'}
                    onClick={() => placeSymbol(slot.id)}
                  >
                    {placed || ''}
                  </Box>
                </Flex>
              </Flex>
            )
          })}
        </VStack>
      </Box>

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={() => {}}
        onFinish={handleFinish}
        isNextDisabled={!allCorrect || isLoading || isCompleted}
      />
    </VStack>
  )
}

export default ConsonantRectangleExercise
