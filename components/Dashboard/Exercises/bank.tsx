import React from 'react'
import { Flex, Text } from '@chakra-ui/react'

// One look for every bank the learner picks from: a "Symbol Bank" (IPA
// symbols) or "Word Bank" (words or transcriptions) heading, and medium
// buttons that read clearly and step down a little on phones.

/** Spread onto a bank's buttons (or tiles) for the shared size. */
export const BANK_BUTTON = {
  h: { base: '44px', md: '48px' },
  minW: { base: '44px', md: '48px' },
  fontSize: { base: 'lg', md: 'xl' },
} as const

/** Word banks hold longer labels, so they get side padding too. */
export const WORD_BANK_BUTTON = { ...BANK_BUTTON, px: 4 } as const

export const BANK_TITLE = {
  symbol: 'Symbol Bank',
  word: 'Word Bank',
} as const

interface BankHeadingProps {
  kind: keyof typeof BANK_TITLE
  /** Controls that sit on the heading's right (e.g. a keyboard toggle). */
  children?: React.ReactNode
  mb?: number
}

export const BankHeading: React.FC<BankHeadingProps> = ({
  kind,
  children,
  mb = 2,
}) => (
  <Flex align="center" justify="space-between" gap={2} mb={mb}>
    <Text fontSize="lg" fontWeight="bold" color="brand.iris">
      {BANK_TITLE[kind]}
    </Text>
    {children}
  </Flex>
)
