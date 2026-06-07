import React, { useEffect, useMemo } from 'react'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { MdAutoAwesome } from 'react-icons/md'
import { keyframes } from '@emotion/react'

// A soft Siri-style gradient pulse that travels + breathes around the quiz
// window edge, plus a banner and confetti rising from the bottom — all
// contained within the quiz window. Auto-dismisses after 10s. Click-through.

const slide = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
`
const breathe = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`
const riseIn = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
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

  return (
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

      {/* Banner — centered in the quiz window, full width */}
      <Flex
        position="absolute"
        left={0}
        right={0}
        top="50%"
        transform="translateY(-50%)"
        px={{ base: 4, md: 8 }}
        justify="center"
      >
        <Flex
          w="100%"
          align="center"
          justify="center"
          gap={4}
          bgGradient="linear(to-r, #5F53CF, #7EACE2)"
          color="white"
          py={5}
          px={8}
          borderRadius="2xl"
          boxShadow="0 16px 50px rgba(95,83,207,0.5)"
          animation={`${riseIn} 0.5s cubic-bezier(0.22,1,0.36,1) both`}
        >
          <Icon
            as={MdAutoAwesome}
            boxSize={8}
            animation={`${twinkle} 1.8s ease-in-out infinite`}
          />
          <Box textAlign="left">
            <Text fontSize="2xl" fontWeight="bold" lineHeight="1.1">
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="sm" opacity={0.9}>
                {subtitle}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default QuizCelebration
