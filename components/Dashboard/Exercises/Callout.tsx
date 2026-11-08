import React from 'react'
import { Box, Text } from '@chakra-ui/react'

// One look for the two kinds of boxed text the exercises show:
//   prompt — material the learner works FROM (a GenAm or unconnected
//            transcription to change): purple, like the rest of the brand.
//   answer — the correct answer once it's revealed: green, everywhere.
const TONES = {
  prompt: {
    bg: 'accent.subtle',
    border: 'brand.iris',
    label: 'brand.iris',
    labelDark: 'brand.iris',
  },
  answer: {
    bg: 'surface.correct',
    border: 'green.500',
    label: 'green.700',
    labelDark: 'green.300',
  },
} as const

type Props = {
  tone: keyof typeof TONES
  label: string
  children: React.ReactNode
  /** Set the body in the IPA font (transcriptions). */
  ipa?: boolean
  mt?: number
  /** Small note under the body, e.g. what an answer's asterisk means. */
  footnote?: string
}

export const Callout: React.FC<Props> = ({
  tone,
  label,
  children,
  ipa,
  mt = 3,
  footnote,
}) => {
  const t = TONES[tone]
  return (
    <Box
      mt={mt}
      bg={t.bg}
      borderLeft="4px solid"
      borderColor={t.border}
      borderRadius="md"
      px={4}
      py={3}
      width="100%"
    >
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="wide"
        color={t.label}
        _dark={{ color: t.labelDark }}
        mb={1}
      >
        {label}
      </Text>
      <Text
        fontSize={ipa ? 'xl' : 'md'}
        color="text.primary"
        className={ipa ? 'ipa-text' : undefined}
      >
        {children}
      </Text>
      {footnote && (
        <Text mt={2} fontSize="sm" fontStyle="italic" color="text.muted">
          {footnote}
        </Text>
      )}
    </Box>
  )
}

export default Callout
