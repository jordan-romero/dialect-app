import React from 'react'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import AboutCard from './AboutCard'
import { coaches } from './utils'

const AboutPageContainer = () => {
  return (
    <Box bg="white">
      {/* Hero */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient="linear(to-br, #F5F2FF 0%, #ECEBFF 45%, #E6F6FB 100%)"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: { base: '400px', md: '600px' },
          height: { base: '400px', md: '600px' },
          bg: 'radial-gradient(closest-side, rgba(114,63,197,0.22), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: { base: '400px', md: '500px' },
          height: { base: '400px', md: '500px' },
          bg: 'radial-gradient(closest-side, rgba(126,172,226,0.28), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      >
        <Container
          maxW="4xl"
          position="relative"
          zIndex={1}
          px={{ base: 5, md: 8 }}
          py={{ base: 16, md: 24 }}
          textAlign="center"
        >
          <Stack spacing={5}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="brand.purple"
              letterSpacing="0.14em"
              textTransform="uppercase"
            >
              Meet the coaches
            </Text>
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="black"
              letterSpacing="-0.02em"
              lineHeight="1.05"
              color="gray.900"
            >
              Trained ears.{' '}
              <Box
                as="span"
                bgGradient="linear(to-r, brand.purple, brand.iris)"
                bgClip="text"
              >
                Working actors.
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.600"
              maxW="640px"
              mx="auto"
              lineHeight="1.7"
            >
              The coaches behind ActingAccents.com teach the systematic,
              IPA-based approach they use every day in professional theatre,
              film, and television — and in the classroom.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Coaches */}
      <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 16, md: 24 }}>
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 10, lg: 10 }}
        >
          {coaches.map((coach) => (
            <AboutCard key={coach.name} {...coach} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default AboutPageContainer
