import React from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import {
  EASE,
  FloatingGlyphs,
  Reveal,
  fadeUp,
  stagger,
} from '../components/PrelaunchHomePage/motion'
import LessonTour from '../components/CoursePage/LessonTour'
import RhymeDemo from '../components/CoursePage/RhymeDemo'
import Curriculum from '../components/CoursePage/Curriculum'
import BrowserFrame from '../components/CoursePage/BrowserFrame'
import type { GetStaticProps } from 'next'
import {
  CourseStats,
  FALLBACK_PHASES,
  FALLBACK_STATS,
  OutlinePhase,
} from '../components/CoursePage/courseOutline'
import { loadCourseOutline } from '../lib/coursePreview'

type Props = { phases: OutlinePhase[]; stats: CourseStats }

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]
const inWords = (n: number) => NUMBER_WORDS[n] ?? String(n)
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

const Eyebrow = ({
  children,
  light = false,
}: {
  children: React.ReactNode
  light?: boolean
}) => (
  <Text
    fontSize="sm"
    fontWeight="bold"
    letterSpacing="0.14em"
    textTransform="uppercase"
    color={light ? 'brand.blueLight' : 'brand.purple'}
  >
    {children}
  </Text>
)

const SectionHeading = ({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string
  title: string
  body?: string
  center?: boolean
}) => (
  <Stack
    spacing={3}
    textAlign={center ? 'center' : 'left'}
    align={center ? 'center' : 'flex-start'}
  >
    <Eyebrow>{eyebrow}</Eyebrow>
    <Heading
      as="h2"
      fontSize={{ base: '3xl', md: '5xl' }}
      fontWeight="black"
      letterSpacing="-0.03em"
      lineHeight="1.05"
      color="gray.900"
      maxW="760px"
    >
      {title}
    </Heading>
    {body && (
      <Text
        fontSize={{ base: 'md', md: 'lg' }}
        color="gray.600"
        lineHeight="1.7"
        maxW="640px"
      >
        {body}
      </Text>
    )}
  </Stack>
)

const PrimaryCta = ({ children }: { children: React.ReactNode }) => (
  <Button
    as={NextLink}
    href="/#early-access"
    size="lg"
    h="56px"
    px={8}
    borderRadius="xl"
    rightIcon={<ArrowForwardIcon />}
    bgGradient="linear(to-r, brand.purple, brand.iris)"
    color="white"
    fontWeight="semibold"
    boxShadow="0 14px 30px -10px rgba(114,63,197,0.6)"
    _hover={{
      bgGradient: 'linear(to-r, brand.purpleLight, brand.purple)',
      transform: 'translateY(-1px)',
    }}
    _active={{ transform: 'translateY(0)' }}
  >
    {children}
  </Button>
)

const statTiles = (stats: CourseStats) => [
  { value: stats.phases, label: 'phases' },
  { value: stats.lessons, label: 'video lessons' },
  { value: stats.exercises, label: 'interactive exercises' },
  { value: stats.handouts, label: 'handouts & charts' },
]

const TOOLS = [
  {
    title: 'Your library',
    body: 'Every chart, template and guide from the course, sorted by lesson and always a click away.',
    img: '/course/library.jpg',
    alt: 'The course library, with handouts grouped by lesson',
    url: 'actingaccents.com/dashboard/resources',
  },
  {
    title: 'A built-in IPA keyboard',
    body: 'Type any IPA symbol with a click or a shortcut, then format and copy your transcription.',
    img: '/course/keyboard.jpg',
    alt: 'The IPA keyboard inside the course',
    url: 'actingaccents.com/dashboard/keyboard',
    href: '/ipa-keyboard',
    linkLabel: 'Try the free keyboard',
  },
  {
    title: 'Coaches on every lesson',
    body: 'Scott and Krista teach the whole course on camera, from the first symbol to performance.',
    img: '/course/lesson-title.jpg',
    alt: 'The opening of lesson 1, What is the IPA?',
    url: 'actingaccents.com/dashboard',
    href: '/about',
    linkLabel: 'Meet the coaches',
  },
]

const CoursePage = ({ phases, stats }: Props) => (
  <>
    <Head>
      <title>Inside the Course | Acting Accents</title>
      <meta
        name="description"
        content={`Take a look inside The Actor's Guide to IPA and Accents: ${inWords(
          stats.phases,
        )} phases of video lessons, interactive exercises and handouts, from your first IPA symbol to performing in British RP.`}
      />
      <meta property="og:title" content="Inside the Course | Acting Accents" />
      <meta
        property="og:description"
        content="Video lessons, interactive exercises and handouts that take actors from their first IPA symbol to performing a dialect."
      />
      <meta property="og:image" content="/course/step-video.jpg" />
    </Head>

    {/* Hero */}
    <Box
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-b, #F1ECFF 0%, #F7F5FF 100%)"
      borderRadius={{ base: '2xl', md: '3xl' }}
      mt={{ base: 2, md: 4 }}
      pt={{ base: 14, md: 24 }}
      pb={{ base: 12, md: 20 }}
    >
      <FloatingGlyphs layout="center" />
      <Container maxW="1100px" position="relative">
        <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
          <Stack spacing={6} align="center" textAlign="center">
            <motion.div variants={fadeUp}>
              <Box
                px={4}
                py={1.5}
                borderRadius="full"
                bg="white"
                borderWidth="1px"
                borderColor="purple.100"
                fontSize="sm"
                fontWeight="semibold"
                color="brand.purple"
                boxShadow="0 8px 20px -14px rgba(30,20,70,0.5)"
              >
                Inside the course
              </Box>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Heading
                as="h1"
                fontSize={{ base: '4xl', sm: '5xl', md: '7xl' }}
                fontWeight="black"
                letterSpacing="-0.04em"
                lineHeight="1"
                color="gray.900"
                maxW="900px"
              >
                The Actor’s Guide to{' '}
                <Box
                  as="span"
                  bgGradient="linear(to-r, brand.purple, brand.iris)"
                  bgClip="text"
                >
                  IPA and Accents
                </Box>
              </Heading>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="gray.600"
                lineHeight="1.65"
                maxW="680px"
              >
                {capitalize(inWords(stats.phases))} phases of video lessons,
                exercises and handouts that take you from your first IPA symbol
                to performing a dialect. Here’s what it looks like inside.
              </Text>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Flex gap={3} wrap="wrap" justify="center">
                <PrimaryCta>Join the early-access list</PrimaryCta>
                <Button
                  as="a"
                  href="#try"
                  size="lg"
                  h="56px"
                  px={7}
                  borderRadius="xl"
                  bg="white"
                  color="gray.800"
                  borderWidth="1px"
                  borderColor="gray.200"
                  fontWeight="semibold"
                  _hover={{ borderColor: 'purple.200', color: 'brand.purple' }}
                >
                  Try an exercise
                </Button>
              </Flex>
            </motion.div>
          </Stack>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        >
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            spacing={{ base: 3, md: 4 }}
            mt={{ base: 12, md: 16 }}
            maxW="900px"
            mx="auto"
          >
            {statTiles(stats).map((s) => (
              <Box
                key={s.label}
                bg="whiteAlpha.900"
                backdropFilter="blur(8px)"
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="purple.50"
                py={{ base: 4, md: 5 }}
                px={3}
                textAlign="center"
              >
                <Text
                  fontSize={{ base: '3xl', md: '4xl' }}
                  fontWeight="black"
                  letterSpacing="-0.03em"
                  lineHeight="1"
                  color="brand.purple"
                >
                  {s.value}
                </Text>
                <Text
                  mt={1.5}
                  fontSize="sm"
                  color="gray.600"
                  fontWeight="semibold"
                >
                  {s.label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </motion.div>
      </Container>
    </Box>

    {/* How a lesson works */}
    <Box py={{ base: 14, md: 24 }}>
      <Container maxW="1200px">
        <Reveal>
          <SectionHeading
            eyebrow="How a lesson works"
            title="Watch it, keep it, practice it."
            body="Each lesson follows the same rhythm, so you always know what’s next. These are real screens from the course."
          />
        </Reveal>
        <Box mt={{ base: 8, md: 14 }}>
          <Reveal delay={0.1}>
            <LessonTour />
          </Reveal>
        </Box>
      </Container>
    </Box>

    {/* Try it */}
    <Box
      id="try"
      scrollMarginTop="80px"
      bg="#F5F2FF"
      borderRadius={{ base: '2xl', md: '3xl' }}
      py={{ base: 14, md: 24 }}
    >
      <Container maxW="1200px">
        <Grid
          templateColumns={{ base: '1fr', lg: '0.9fr 1.1fr' }}
          gap={{ base: 10, lg: 16 }}
          alignItems="center"
        >
          <Reveal>
            <Stack spacing={5}>
              <SectionHeading
                eyebrow="Try one now"
                title="Spelling lies. Sounds don’t."
                body="This is the first exercise in the course, from the free lesson “Why the IPA?”. Match the words that really rhyme, and watch the IPA show you why."
              />
              <Text color="gray.500" fontSize="sm">
                Inside the course there are {stats.exercises - 1} more, from an
                interactive vowel chart to transcribing Hamlet.
              </Text>
            </Stack>
          </Reveal>
          <Reveal delay={0.1}>
            <RhymeDemo />
          </Reveal>
        </Grid>
      </Container>
    </Box>

    {/* Curriculum */}
    <Box py={{ base: 14, md: 24 }}>
      <Container maxW="960px">
        <Reveal>
          <SectionHeading
            center
            eyebrow="The curriculum"
            title="From the first symbol to the stage."
            body={`${stats.lessons} lessons and ${
              stats.checkpoints
            } checkpoints across ${inWords(
              stats.phases,
            )} phases. Each phase opens when you finish the one before it, and the first ${
              stats.freeLessons
            } lessons are free.`}
          />
        </Reveal>
        <Box mt={{ base: 8, md: 12 }}>
          <Curriculum phases={phases} />
        </Box>
      </Container>
    </Box>

    {/* Toolkit */}
    <Box
      bg="#F7F8FC"
      borderRadius={{ base: '2xl', md: '3xl' }}
      py={{ base: 14, md: 24 }}
    >
      <Container maxW="1200px">
        <Reveal>
          <SectionHeading
            eyebrow="Built in"
            title="Everything you need sits next to the lessons."
          />
        </Reveal>
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={{ base: 8, md: 6, lg: 8 }}
          mt={{ base: 8, md: 12 }}
        >
          {TOOLS.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.08}>
              <Stack spacing={4}>
                <BrowserFrame url={t.url}>
                  <Image
                    src={t.img}
                    alt={t.alt}
                    position="absolute"
                    inset={0}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    objectPosition="left top"
                    loading="lazy"
                  />
                </BrowserFrame>
                <Box>
                  <Text
                    fontWeight="black"
                    fontSize="xl"
                    color="gray.900"
                    letterSpacing="-0.01em"
                  >
                    {t.title}
                  </Text>
                  <Text mt={1.5} color="gray.600" lineHeight="1.65">
                    {t.body}
                  </Text>
                  {t.href && (
                    <Button
                      as={NextLink}
                      href={t.href}
                      variant="link"
                      mt={3}
                      color="brand.purple"
                      fontWeight="semibold"
                      rightIcon={<ArrowForwardIcon />}
                    >
                      {t.linkLabel}
                    </Button>
                  )}
                </Box>
              </Stack>
            </Reveal>
          ))}
        </SimpleGrid>
      </Container>
    </Box>

    {/* Final call to action */}
    <Box
      bg="#140D2A"
      position="relative"
      overflow="hidden"
      borderRadius={{ base: '2xl', md: '3xl' }}
      mt={{ base: 4, md: 6 }}
      mb={{ base: 4, md: 12 }}
      py={{ base: 16, md: 24 }}
    >
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        backgroundImage="radial-gradient(circle at 20% 0%, rgba(114,63,197,0.45), transparent 55%), radial-gradient(circle at 85% 100%, rgba(95,83,207,0.35), transparent 50%)"
      />
      <Container maxW="760px" position="relative">
        <Reveal>
          <Stack spacing={6} align="center" textAlign="center">
            <Eyebrow light>Launching soon</Eyebrow>
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="black"
              letterSpacing="-0.03em"
              lineHeight="1.05"
              color="white"
            >
              {stats.freeLessons > 0
                ? `Start with the ${inWords(stats.freeLessons)} free lessons.`
                : 'Be first in line when it opens.'}
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="whiteAlpha.800"
              lineHeight="1.7"
            >
              Join the early-access list and we’ll let you know the day the
              course opens, with a launch-day discount.
            </Text>
            <PrimaryCta>Join the early-access list</PrimaryCta>
          </Stack>
        </Reveal>
      </Container>
    </Box>
  </>
)

// Built from the course database and refreshed at most once an hour, so new
// or renamed lessons show up without a deploy. If the database can't be
// reached, the page falls back to the snapshot in courseOutline.ts.
export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const { phases, stats } = await loadCourseOutline()
    return { props: { phases, stats }, revalidate: 3600 }
  } catch (err) {
    console.error(
      'course page: outline load failed, using fallback',
      err instanceof Error ? err.name : 'unknown',
    )
    return {
      props: { phases: FALLBACK_PHASES, stats: FALLBACK_STATS },
      revalidate: 300,
    }
  }
}

export default CoursePage
