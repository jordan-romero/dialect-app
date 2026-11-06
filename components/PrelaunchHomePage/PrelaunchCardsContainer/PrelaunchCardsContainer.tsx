import React from 'react'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaGraduationCap, FaBook, FaRegLightbulb } from 'react-icons/fa'
import PrelaunchCard from './PrelaunchCard'
import { CardData } from '../types'

const cardsData: CardData[] = [
  {
    icon: FaBook,
    header: 'Our Promise',
    body: 'Learn how to effectively use the International Phonetic Alphabet (IPA) for the study of dialects and accents. Professional coaches agree that actors with a solid IPA background are quicker studies and perform more authentically — whether on stage, on set, or behind the mic.',
    buttonText: 'Meet the coaches',
    href: 'about',
  },
  {
    icon: FaGraduationCap,
    header: 'The IPA Advantage',
    body: 'Our first series, “The Actor’s Guide to IPA and Accents,” teaches you to read and write the IPA, chart any dialect you choose, and make consistent, compelling choices that elevate your performance. Each lesson comes with exercises to gauge your progress.',
    buttonText: 'Read testimonials',
    href: '#testimonials',
  },
  {
    icon: FaRegLightbulb,
    header: 'Complete Control',
    body: 'This approach gives you confidence, credibility, and complete control of your own creative process. It’s the most efficient method for learning a dialect available to actors — and you’ll never have to rely on mere mimicry again.',
    buttonText: 'Contact us',
    href: 'contact',
  },
]

const PrelaunchCardsContainer = () => {
  return (
    <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 20, md: 28 }}>
      <Stack spacing={4} textAlign="center" mb={{ base: 10, md: 14 }}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="brand.purple"
          letterSpacing="0.14em"
          textTransform="uppercase"
        >
          Why ActingAccents.com
        </Text>
        <Heading
          as="h2"
          fontSize={{ base: '3xl', md: '5xl' }}
          fontWeight="black"
          letterSpacing="-0.02em"
          color="gray.900"
          lineHeight="1.1"
        >
          A method, not a guess.
        </Heading>
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          color="gray.600"
          maxW="640px"
          mx="auto"
        >
          Three reasons actors, coaches, and language enthusiasts are joining
          the early-access list.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
        {cardsData.map((card) => (
          <PrelaunchCard key={card.header} data={card} />
        ))}
      </SimpleGrid>

      <Box textAlign="center" mt={{ base: 10, md: 14 }}>
        <Text fontSize="sm" color="gray.500">
          Every lesson pairs clear instruction with hands-on exercises you can
          try right in your browser.
        </Text>
      </Box>
    </Container>
  )
}

export default PrelaunchCardsContainer
