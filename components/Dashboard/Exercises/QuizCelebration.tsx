import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { MdAutoAwesome } from 'react-icons/md'
import { keyframes } from '@emotion/react'

// A soft Siri-style gradient pulse + confetti within the quiz window, plus a
// celebratory banner that sticks to the top of the screen (a centered toast)
// for ~10s. Click-through (pointer-events: none).

const slide = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
`
const breathe = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`
// Banner drops in from the top and holds (final transform keeps it centered).
const dropIn = keyframes`
  0% { opacity: 0; transform: translate(-50%, -18px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
`
const twinkle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
  50% { transform: scale(1.15) rotate(8deg); opacity: 1; }
`
// Confetti rises from the bottom of the window and drifts off the top.
const riseUp = keyframes`
  0% { bottom: -6%; transform: rotate(0deg); opacity: 1; }
  85% { opacity: 1; }
  100% { bottom: 106%; transform: rotate(720deg); opacity: 0; }
`

const COLORS = [
  '#5F53CF',
  '#7EACE2',
  '#8B5CF6',
  '#A78BFA',
  '#60A5FA',
  '#B794F4',
]

interface Props {
  onDone: () => void
  title?: string
  subtitle?: string
  /** Match the quiz window's border radius. */
  radius?: string
  durationMs?: number
}

export const QuizCelebration: React.FC<Props> = ({
  onDone,
  title = 'Nice work!',
  subtitle = 'Quiz complete',
  radius = 'md',
  durationMs = 10000,
}) => {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs)
    return () => clearTimeout(t)
  }, [onDone, durationMs])

  // Stable confetti pieces for this mount.
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.8,
        duration: 2.6 + Math.random() * 2.4,
        size: 6 + Math.random() * 9,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      })),
    [],
  )

  // Banner: a centered toast stuck to the top of the screen. Portaled to body
  // so it's never clipped by the quiz window or affected by scroll.
  const banner =
    typeof document !== 'undefined'
      ? createPortal(
          <Flex
            position="fixed"
            top={5}
            left="50%"
            transform="translateX(-50%)"
            zIndex={1500}
            pointerEvents="none"
            align="center"
            gap={4}
            maxW={{ base: 'calc(100vw - 24px)', md: '560px' }}
            bgGradient="linear(to-r, #5F53CF, #7EACE2)"
            color="white"
            py={4}
            px={7}
            borderRadius="2xl"
            boxShadow="0 14px 44px rgba(95,83,207,0.5)"
            animation={`${dropIn} 0.45s cubic-bezier(0.22,1,0.36,1) both`}
          >
            <Icon
              as={MdAutoAwesome}
              boxSize={7}
              animation={`${twinkle} 1.8s ease-in-out infinite`}
            />
            <Box textAlign="left">
              <Text fontSize="xl" fontWeight="bold" lineHeight="1.1">
                {title}
              </Text>
              {subtitle && (
                <Text fontSize="sm" opacity={0.9}>
                  {subtitle}
                </Text>
              )}
            </Box>
          </Flex>,
          document.body,
        )
      : null

  return (
    <>
      {/* Edge pulse + confetti — within the quiz window */}
      <Box
        position="absolute"
        inset={0}
        borderRadius={radius}
        overflow="hidden"
        pointerEvents="none"
        zIndex={20}
      >
        {/* Soft inner glow that breathes */}
        <Box
          position="absolute"
          inset={0}
          borderRadius="inherit"
          sx={{
            boxShadow:
              'inset 0 0 32px 4px rgba(95,83,207,0.55), inset 0 0 70px 14px rgba(126,172,226,0.4)',
          }}
          animation={`${breathe} 2s ease-in-out infinite`}
        />

        {/* Gradient edge that travels around the border (Siri-like) */}
        <Box
          position="absolute"
          inset={0}
          borderRadius="inherit"
          sx={{
            background:
              'linear-gradient(90deg, #5F53CF, #7EACE2, #B794F4, #7EACE2, #5F53CF)',
            backgroundSize: '300% 100%',
            padding: '3px',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            filter: 'blur(2px)',
          }}
          animation={`${slide} 2.5s linear infinite, ${breathe} 2s ease-in-out infinite`}
        />

        {/* Confetti rising from the bottom of the window */}
        {pieces.map((p, i) => (
          <Box
            key={i}
            position="absolute"
            bottom="-6%"
            left={`${p.left}%`}
            w={`${p.size}px`}
            h={`${p.size}px`}
            bg={p.color}
            borderRadius={p.round ? 'full' : '2px'}
            animation={`${riseUp} ${p.duration}s ease-out ${p.delay}s infinite`}
          />
        ))}
      </Box>

      {banner}
    </>
  )
}

export default QuizCelebration
