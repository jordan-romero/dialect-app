import React from 'react'
import {
  Box,
  Container,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaStar } from 'react-icons/fa'
import PrelaunchCarousel from './PrelaunchCarousel'
import { cards } from './utils'
import { Reveal } from '../motion'

const PrelaunchTestimonialsContainer = () => {
  return (
    <Container
      maxW="6xl"
      px={{ base: 5, md: 8 }}
      py={{ base: 20, md: 28 }}
      id="testimonials"
    >
      <Reveal>
        <Stack spacing={4} textAlign="center" mb={{ base: 10, md: 14 }}>
          <HStack spacing={1} justify="center" color="yellow.400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Icon key={i} as={FaStar} boxSize={4} />
            ))}
          </HStack>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="brand.purple"
            letterSpacing="0.14em"
            textTransform="uppercase"
          >
            Testimonials
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="black"
            letterSpacing="-0.02em"
            color="gray.900"
            lineHeight="1.1"
            sx={{ textWrap: 'balance' }}
          >
            From working actors and coaches.
          </Heading>
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="gray.600"
            maxW="640px"
            mx="auto"
            sx={{ textWrap: 'balance' }}
          >
            Students who came for a role and left with a career-long skill.
          </Text>
        </Stack>
      </Reveal>

      <Reveal delay={0.15}>
        <Box>
          <PrelaunchCarousel cards={cards} />
        </Box>
      </Reveal>
    </Container>
  )
}

export default PrelaunchTestimonialsContainer
