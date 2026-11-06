import {
  Badge,
  Box,
  Heading,
  HStack,
  Stack,
  Tag,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import React from 'react'
import { personas } from './PrelaunchPersonas/utils'

const PrelaunchMain = () => {
  return (
    <Stack spacing={6} maxW={{ base: '100%', lg: '620px' }}>
      <Badge
        alignSelf="flex-start"
        bg="whiteAlpha.800"
        color="brand.purple"
        px={3}
        py={1.5}
        borderRadius="full"
        textTransform="none"
        fontSize="sm"
        fontWeight="semibold"
        letterSpacing="0.01em"
        boxShadow="0 1px 2px rgba(0,0,0,0.04)"
      >
        <HStack spacing={2}>
          <Box w="6px" h="6px" borderRadius="full" bg="brand.purple" />
          <Text as="span">Early access coming soon</Text>
        </HStack>
      </Badge>

      <Heading
        as="h1"
        fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
        fontWeight="black"
        lineHeight="1.05"
        letterSpacing="-0.02em"
        color="gray.900"
      >
        Master any{' '}
        <Box
          as="span"
          bgGradient="linear(to-r, brand.purple, brand.iris)"
          bgClip="text"
        >
          accent or dialect
        </Box>{' '}
        — on your own.
      </Heading>

      <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600" lineHeight="1.7">
        ActingAccents.com teaches actors and performers the International
        Phonetic Alphabet (IPA) — the systematic method that top dialect coaches
        agree produces the most authentic performances. No more guesswork, no
        more mimicry.
      </Text>

      <Box pt={2}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.500"
          letterSpacing="0.08em"
          textTransform="uppercase"
          mb={3}
        >
          Built for
        </Text>
        <Wrap spacing={2}>
          {personas.map((persona) => (
            <WrapItem key={persona}>
              <Tag
                size="md"
                bg="white"
                color="gray.700"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="full"
                px={3}
                py={1.5}
                fontWeight="medium"
                boxShadow="0 1px 2px rgba(17,24,39,0.04)"
              >
                {persona}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
    </Stack>
  )
}

export default PrelaunchMain
