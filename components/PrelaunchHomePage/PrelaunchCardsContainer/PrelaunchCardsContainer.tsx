import React from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaGraduationCap, FaBook, FaRegLightbulb } from 'react-icons/fa'
import PrelaunchCard from './PrelaunchCard'
import { CardData } from '../types'
import { motion } from 'framer-motion'
import { EASE, Reveal } from '../motion'
import { AccentToggleVisual, ChartVisual, ScriptVisual } from './CardVisuals'

const visuals = [
  <ChartVisual key="chart" />,
  <ScriptVisual key="script" />,
  <AccentToggleVisual key="toggle" />,
]

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
      <Reveal>
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
            sx={{ textWrap: 'balance' }}
          >
            A method, not a guess.
          </Heading>
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="gray.600"
            maxW="640px"
            mx="auto"
            sx={{ textWrap: 'balance' }}
          >
            Three reasons actors, coaches, and language enthusiasts are joining
            the early-access list.
          </Text>
        </Stack>
      </Reveal>

      {/* Bento: the promise is the tall card, the other two stack beside it */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1.05fr 1fr' }}
        templateRows={{ base: 'auto', lg: 'auto auto' }}
        gap={{ base: 6, md: 7 }}
      >
        {cardsData.map((card, i) => (
          <GridItem
            key={card.header}
            rowSpan={{ base: 1, lg: i === 0 ? 2 : 1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.75, ease: EASE, delay: i * 0.12 }}
              style={{ height: '100%' }}
            >
              <PrelaunchCard
                data={card}
                visual={visuals[i]}
                featured={i === 0}
              />
            </motion.div>
          </GridItem>
        ))}
      </Grid>

      <Reveal delay={0.2}>
        <Box textAlign="center" mt={{ base: 10, md: 14 }}>
          <Text fontSize="sm" color="gray.500">
            Every lesson pairs clear instruction with hands-on exercises you can
            try right in your browser.
          </Text>
        </Box>
      </Reveal>
    </Container>
  )
}

export default PrelaunchCardsContainer
