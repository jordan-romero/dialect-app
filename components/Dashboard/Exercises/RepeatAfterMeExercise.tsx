import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react'
import { MdVolumeUp, MdMic, MdStop } from 'react-icons/md'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'

interface LexicalSet {
  name: string
  ga: string
  rp: string
}
interface Item {
  n: number
  lexicalSets: LexicalSet[]
  note?: string
  sentence: string
  ipa: string
  audioUrl: string
}
interface RepeatAfterMeData {
  id: number
  lessonId: number
  quizType: string
  instructions: string
  questions: Array<{ id: number; text: string }>
  items: Item[]
}

interface Props {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

export const RepeatAfterMeExercise: React.FC<Props> = ({
  lessonId,
  onComplete,
}) => {
  const [data, setData] = useState<RepeatAfterMeData | null>(null)
  const [index, setIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  // Recorded playback per item (object URLs; practice only, not persisted).
  const [recordings, setRecordings] = useState<Record<number, string>>({})

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const toast = useToast()

  useEffect(() => {
    fetch('/api/repeatAfterMe')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: RepeatAfterMeData | null) => d && setData(d))
      .catch((e) => console.error('Error loading repeat-after-me:', e))
  }, [])

  // Completion is a simple marker (this is a practice drill, not graded).
  useEffect(() => {
    if (!data) return
    fetch(`/api/userQuizProgress?quizId=${data.id}&lessonId=${lessonId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setIsCompleted(d.isCompleted))
      .catch((e) => console.error('Error loading progress:', e))
  }, [data, lessonId])

  // Revoke object URLs on unmount so we don't leak blobs.
  useEffect(() => {
    return () => {
      Object.values(recordings).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const item = data?.items[index]

  const playClip = () => {
    if (!item) return
    const audio = new Audio(item.audioUrl)
    audio.play().catch((e) => console.error('Audio play failed:', e))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordings((prev) => {
          // Replace any previous recording for this item.
          if (prev[index]) URL.revokeObjectURL(prev[index])
          return { ...prev, [index]: url }
        })
        stream.getTracks().forEach((t) => t.stop())
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error('Microphone error:', e)
      toast({
        title: 'Microphone unavailable',
        description:
          'Allow microphone access to record yourself, or just listen and repeat aloud.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const goPrev = () => {
    if (isRecording) stopRecording()
    setIndex((i) => Math.max(0, i - 1))
  }

  const goNext = () => {
    if (isRecording) stopRecording()
    setIndex((i) => Math.min((data?.items.length ?? 1) - 1, i + 1))
  }

  const handleFinish = async () => {
    if (isRecording) stopRecording()
    if (!data) return
    if (!isCompleted) {
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
              textAnswer: 'completed',
            })),
          }),
        })
        if (res.ok) setIsCompleted(true)
      } catch (e) {
        console.error('Error submitting repeat-after-me:', e)
      } finally {
        setIsLoading(false)
      }
    }
    onComplete()
  }

  if (!data) return <QuizSkeleton />
  if (!item) return <Text>No items found.</Text>

  return (
    <VStack spacing={5} align="stretch">
      <Box
        bg="gray.50"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm">
          <b>Instructions:</b> {data.instructions}
        </Text>
      </Box>

      <Text fontSize="sm" color="gray.600">
        {index + 1} of {data.items.length}
      </Text>

      {/* Lexical set(s) and the GA → RP change */}
      <Table size="sm" variant="simple" maxW="420px">
        <Thead>
          <Tr>
            <Th>Lexical Set</Th>
            <Th textAlign="center">GA</Th>
            <Th textAlign="center">RP</Th>
          </Tr>
        </Thead>
        <Tbody>
          {item.lexicalSets.map((s) => (
            <Tr key={s.name}>
              <Td fontWeight="bold">{s.name}</Td>
              <Td
                textAlign="center"
                fontFamily="'Charis SIL', serif"
                fontSize="lg"
              >
                {s.ga}
              </Td>
              <Td
                textAlign="center"
                fontFamily="'Charis SIL', serif"
                fontSize="lg"
                color="brand.purple"
              >
                {s.rp}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {item.note && (
        <Text fontSize="sm" fontStyle="italic" color="gray.600">
          Note: {item.note}
        </Text>
      )}

      {/* Sentence + transcription */}
      <Box>
        <Text fontSize="lg" mb={2}>
          “{item.sentence}”
        </Text>
        <Text fontFamily="'Charis SIL', serif" fontSize="lg" color="gray.700">
          {item.ipa}
        </Text>
      </Box>

      {/* Listen + record */}
      <HStack spacing={3} flexWrap="wrap">
        <Button
          leftIcon={<MdVolumeUp />}
          onClick={playClip}
          variant="brandBold"
        >
          Play clip
        </Button>
        {!isRecording ? (
          <Button
            leftIcon={<MdMic />}
            onClick={startRecording}
            colorScheme="red"
            variant="outline"
          >
            Record yourself
          </Button>
        ) : (
          <Button
            leftIcon={<MdStop />}
            onClick={stopRecording}
            colorScheme="red"
          >
            Stop recording
          </Button>
        )}
        {isRecording && (
          <Badge colorScheme="red" alignSelf="center">
            ● Recording…
          </Badge>
        )}
      </HStack>

      {recordings[index] && (
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={1}>
            Your recording:
          </Text>
          {/* key forces the player to reload when the recording is replaced */}
          <audio
            key={recordings[index]}
            controls
            src={recordings[index]}
            style={{ width: '100%', maxWidth: 420 }}
          />
        </Box>
      )}

      <QuizNavigation
        currentQuestion={index + 1}
        totalQuestions={data.items.length}
        onPrevious={goPrev}
        onNext={goNext}
        onFinish={handleFinish}
        // Practice drill: free to move through items. Finishing the last one
        // marks it complete.
        isNextDisabled={isLoading}
        isCompleted={isCompleted}
      />
    </VStack>
  )
}

export default RepeatAfterMeExercise
