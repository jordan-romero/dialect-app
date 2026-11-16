import React, { useEffect, useRef, useState } from 'react'
import { Badge, Box, Button, HStack, Text, useToast } from '@chakra-ui/react'
import { MdMic, MdStop } from 'react-icons/md'

// Record-yourself control with playback: the learner records, listens back,
// and can re-record. Recordings stay in the browser (object URLs) — they are
// practice, never uploaded or saved.

interface VoiceRecorderProps {
  /** Called with true once a recording exists, so the parent can gate Next. */
  onRecordedChange?: (hasRecording: boolean) => void
  /** Read-only (e.g. a completed quiz): no recording controls. */
  isDisabled?: boolean
  /** A recording was made in an earlier visit; it isn't kept, but say so. */
  wasRecorded?: boolean
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordedChange,
  isDisabled,
  wasRecorded,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const urlRef = useRef<string | null>(null)
  const toast = useToast()

  // Stop the mic and free the blob when the control goes away.
  useEffect(
    () => () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    [],
  )

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        const next = URL.createObjectURL(blob)
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        urlRef.current = next
        setUrl(next)
        onRecordedChange?.(true)
        stream.getTracks().forEach((t) => t.stop())
      }
      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error('Microphone error:', e)
      toast({
        title: 'Microphone unavailable',
        description:
          'Allow microphone access in your browser to record yourself.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const stop = () => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  if (isDisabled) {
    return wasRecorded ? (
      <Text fontSize="sm" color="text.muted">
        ✓ Recorded
      </Text>
    ) : null
  }

  return (
    <Box width="100%">
      <HStack spacing={3} flexWrap="wrap">
        {!isRecording ? (
          <Button
            leftIcon={<MdMic />}
            onClick={start}
            colorScheme="red"
            variant="outline"
          >
            {url ? 'Record again' : 'Record yourself'}
          </Button>
        ) : (
          <Button leftIcon={<MdStop />} onClick={stop} colorScheme="red">
            Stop recording
          </Button>
        )}
        {isRecording && (
          <Badge colorScheme="red" alignSelf="center">
            ● Recording…
          </Badge>
        )}
      </HStack>
      {url && (
        <Box mt={3}>
          <Text fontSize="sm" fontWeight="bold" mb={1}>
            Your recording:
          </Text>
          {/* key reloads the player when the recording is replaced */}
          <audio
            key={url}
            controls
            src={url}
            style={{ width: '100%', maxWidth: 420 }}
          />
          <Text fontSize="xs" color="text.muted" mt={1}>
            Listen to yourself, then play the original audio again to compare.
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default VoiceRecorder
