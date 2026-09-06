import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Icon, Skeleton } from '@chakra-ui/react'
import { MdVolumeOff } from 'react-icons/md'

interface Props {
  src: string
  title: string
  height?: string
  width?: string
}

/**
 * Lesson video player.
 *
 * The lesson videos are plain .mp4 files on S3, so this is a real <video>
 * element rather than an iframe around the browser's built-in media viewer —
 * an iframe can't be told to autoplay, and gives us no playback events.
 *
 * Autoplay: browsers only allow *audible* autoplay once the user has built up
 * enough interaction with the site (Chrome's media engagement heuristic);
 * before that, play() rejects. So we try with sound first and, if that's
 * refused, fall back to muted playback and surface an unmute button — the
 * lesson still starts on its own and one click restores the audio.
 */
const LessonVideo: React.FC<Props> = ({
  src,
  title,
  height = '530px',
  width = '95%',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [mutedByFallback, setMutedByFallback] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let cancelled = false

    const start = async () => {
      try {
        video.muted = false
        await video.play()
      } catch {
        // Audible autoplay refused — retry muted so the lesson still starts.
        if (cancelled) return
        try {
          video.muted = true
          await video.play()
          if (!cancelled) setMutedByFallback(true)
        } catch {
          // Autoplay refused outright; the controls are still there.
        }
      }
    }
    start()

    return () => {
      cancelled = true
    }
  }, [src])

  const unmute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    setMutedByFallback(false)
    video.play().catch(() => {})
  }

  return (
    <Box position="relative" w={width} mx="auto" h={height}>
      {!loaded && <Skeleton position="absolute" inset={0} borderRadius="md" />}
      <video
        ref={videoRef}
        src={src}
        title={title}
        controls
        autoPlay
        playsInline
        preload="auto"
        onLoadedData={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
          background: '#000',
        }}
      />
      {mutedByFallback && (
        <Button
          position="absolute"
          top={3}
          left={3}
          size="sm"
          variant="brandBold"
          leftIcon={<Icon as={MdVolumeOff} />}
          onClick={unmute}
        >
          Tap for sound
        </Button>
      )}
    </Box>
  )
}

export default LessonVideo
