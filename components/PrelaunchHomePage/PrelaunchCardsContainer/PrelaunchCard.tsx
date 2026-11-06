import React, { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { CardData } from '../types'

interface PrelaunchCardProps {
  data: CardData
}

const PrelaunchCard = ({ data }: PrelaunchCardProps) => {
  const { header, body, buttonText, icon, href } = data
  const [isExpanded, setIsExpanded] = useState(false)
  const MOBILE_PREVIEW_LENGTH = 180
  const isMobile = useBreakpointValue({ base: true, md: false })

  const needsMobileClamp = !!isMobile && body.length > MOBILE_PREVIEW_LENGTH
  const displayedBody =
    needsMobileClamp && !isExpanded
      ? `${body.slice(0, MOBILE_PREVIEW_LENGTH).trimEnd()}…`
      : body

  return (
    <Stack
      spacing={5}
      p={{ base: 6, md: 8 }}
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.100"
      boxShadow="0 1px 2px rgba(17,24,39,0.04), 0 8px 24px -16px rgba(17,24,39,0.12)"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow:
          '0 1px 2px rgba(17,24,39,0.04), 0 20px 36px -20px rgba(114,63,197,0.3)',
        borderColor: 'brand.purpleLight',
      }}
      h="100%"
    >
      <Flex
        w="56px"
        h="56px"
        borderRadius="xl"
        align="center"
        justify="center"
        bgGradient="linear(to-br, brand.purple, brand.iris)"
        color="white"
        boxShadow="0 8px 20px -8px rgba(114,63,197,0.55)"
      >
        <Icon as={icon} boxSize={6} />
      </Flex>

      <Stack spacing={3} flex="1">
        <Heading
          as="h3"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="bold"
          color="gray.900"
          letterSpacing="-0.01em"
        >
          {header}
        </Heading>
        <Text color="gray.600" lineHeight="1.7">
          {displayedBody}
        </Text>
        {needsMobileClamp && (
          <Text
            as="button"
            onClick={() => setIsExpanded((v) => !v)}
            alignSelf="flex-start"
            color="brand.purple"
            fontWeight="semibold"
            fontSize="sm"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </Text>
        )}
      </Stack>

      <Box>
        <Button
          as="a"
          href={href}
          variant="ghost"
          color="brand.purple"
          fontWeight="semibold"
          px={0}
          rightIcon={<ArrowForwardIcon />}
          _hover={{ bg: 'transparent', color: 'brand.purpleLight' }}
        >
          {buttonText}
        </Button>
      </Box>
    </Stack>
  )
}

export default PrelaunchCard
