import React from 'react'
import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { CardData } from '../types'

interface PrelaunchCardProps {
  data: CardData
  visual?: React.ReactNode
  featured?: boolean
}

const PrelaunchCard = ({ data, visual, featured }: PrelaunchCardProps) => {
  const { header, body, buttonText, icon, href } = data

  // Soft spotlight that follows the cursor across the card.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Stack
      role="group"
      onMouseMove={onMove}
      position="relative"
      overflow="hidden"
      spacing={6}
      p={{ base: 5, md: featured ? 8 : 7 }}
      h="100%"
      bg="white"
      borderRadius="3xl"
      borderWidth="1px"
      borderColor="gray.100"
      boxShadow="0 1px 2px rgba(17,24,39,0.04), 0 12px 32px -20px rgba(17,24,39,0.18)"
      transition="transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(460px circle at var(--mx, 50%) var(--my, 0%), rgba(114,63,197,0.09), transparent 60%)',
        opacity: 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }}
      _hover={{
        transform: 'translateY(-6px)',
        borderColor: 'purple.100',
        boxShadow:
          '0 1px 2px rgba(17,24,39,0.04), 0 28px 48px -24px rgba(114,63,197,0.35)',
      }}
      sx={{ '&:hover::before': { opacity: 1 } }}
    >
      {visual && (
        <Box position="relative" zIndex={1} flex={featured ? '1' : undefined}>
          {visual}
        </Box>
      )}

      <Stack spacing={3} position="relative" zIndex={1}>
        <Flex align="center" gap={3}>
          <Flex
            as={motion.div}
            whileHover={{ rotate: -8, scale: 1.08 }}
            w="40px"
            h="40px"
            borderRadius="lg"
            align="center"
            justify="center"
            bgGradient="linear(to-br, brand.purple, brand.iris)"
            color="white"
            boxShadow="0 8px 20px -8px rgba(114,63,197,0.55)"
            flexShrink={0}
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
          <Heading
            as="h3"
            fontSize={{ base: 'xl', md: featured ? '3xl' : '2xl' }}
            fontWeight="bold"
            color="gray.900"
            letterSpacing="-0.02em"
          >
            {header}
          </Heading>
        </Flex>
        <Text color="gray.600" lineHeight="1.7">
          {body}
        </Text>
      </Stack>

      <Box position="relative" zIndex={1}>
        <Button
          as="a"
          href={href}
          variant="ghost"
          color="brand.purple"
          fontWeight="semibold"
          px={0}
          rightIcon={
            <ArrowForwardIcon
              transition="transform 0.2s"
              _groupHover={{ transform: 'translateX(4px)' }}
            />
          }
          _hover={{ bg: 'transparent', color: 'brand.purpleLight' }}
        >
          {buttonText}
        </Button>
      </Box>
    </Stack>
  )
}

export default PrelaunchCard
