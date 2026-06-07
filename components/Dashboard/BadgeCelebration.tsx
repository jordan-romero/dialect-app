import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Box, Button, Flex, Icon, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { visualFor } from './badgeVisuals'

export interface EarnedBadge {
  id: string
  label: string
  hint: string
  count?: number
}

const pop = keyframes`
  0% { opacity: 0; transform: scale(0.8) translateY(10px); }
  60% { opacity: 1; transform: scale(1.03); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
`
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
const fall = keyframes`
  0% { top: -8%; transform: rotate(0deg); opacity: 1; }
  100% { top: 108%; transform: rotate(540deg); opacity: 0.85; }
`
const shine = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.08); opacity: 1; }
`

interface Props {
  badge: EarnedBadge
  onClose: () => void
  durationMs?: number
}

const BadgeCelebration: React.FC<Props> = ({
  badge,
  onClose,
  durationMs = 8000,
}) => {
  const visual = visualFor(badge.id)

  useEffect(() => {
    const t = setTimeout(onClose, durationMs)
    return () => clearTimeout(t)
  }, [onClose, durationMs])

  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.4 + Math.random() * 2,
        size: 6 + Math.random() * 8,
        round: i % 2 === 0,
      })),
    [],
  )

  if (typeof document === 'undefined') return null

  return createPortal(
    <Flex
      position="fixed"
      inset={0}
      zIndex={2000}
      align="center"
      justify="center"
      onClick={onClose}
      cursor="pointer"
      animation={`${fadeIn} 0.25s ease`}
    >
      {/* Full-screen badge-gradient wash */}
      <Box
        position="absolute"
        inset={0}
        bgGradient={visual.grad}
        opacity={0.96}
      />
      <Box
        position="absolute"
        inset={0}
        bg="blackAlpha.300"
        backdropFilter="blur(2px)"
      />

      {/* Confetti (white on the colored wash) */}
      <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none">
        {pieces.map((p, i) => (
          <Box
            key={i}
            position="absolute"
            top="-8%"
            left={`${p.left}%`}
            w={`${p.size}px`}
            h={`${p.size}px`}
            bg="whiteAlpha.800"
            borderRadius={p.round ? 'full' : '2px'}
            animation={`${fall} ${p.duration}s linear ${p.delay}s infinite`}
          />
        ))}
      </Box>

      <VStack
        position="relative"
        spacing={5}
        color="white"
        textAlign="center"
        px={6}
        animation={`${pop} 0.5s cubic-bezier(0.22,1,0.36,1) both`}
      >
        <Flex
          align="center"
          justify="center"
          boxSize="128px"
          borderRadius="full"
          bg="whiteAlpha.300"
          border="3px solid"
          borderColor="whiteAlpha.800"
          boxShadow="0 16px 50px rgba(0,0,0,0.3)"
          animation={`${shine} 2.2s ease-in-out infinite`}
        >
          <Icon as={visual.icon} boxSize={16} color="white" />
        </Flex>
        <Text
          fontSize="sm"
          fontWeight="bold"
          letterSpacing="0.15em"
          textTransform="uppercase"
          opacity={0.9}
        >
          {badge.count && badge.count > 1
            ? `Earned ×${badge.count}`
            : 'Badge earned'}
        </Text>
        <Box>
          <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1">
            {badge.label}
          </Text>
          <Text fontSize="md" opacity={0.92} mt={2} maxW="360px">
            {badge.hint}
          </Text>
        </Box>
        <Button
          variant="brandWhite"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          mt={2}
        >
          Nice!
        </Button>
      </VStack>
    </Flex>,
    document.body,
  )
}

export default BadgeCelebration
