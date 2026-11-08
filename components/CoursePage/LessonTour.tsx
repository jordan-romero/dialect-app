import React, { useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, Icon, Stack, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  FiBookOpen,
  FiCheckSquare,
  FiFileText,
  FiPlayCircle,
} from 'react-icons/fi'
import BrowserFrame from './BrowserFrame'
import { EASE } from '../PrelaunchHomePage/motion'

type Step = {
  key: string
  label: string
  title: string
  body: string
  img: string
  alt: string
  icon: React.ElementType
}

const STEPS: Step[] = [
  {
    key: 'description',
    label: 'Overview',
    title: 'Know what you’re learning',
    body: 'Every lesson opens with what it covers and the steps inside it: video, handouts, exercises.',
    img: '/course/step-description.jpg',
    alt: 'A lesson overview listing a video, a handout and an exercise',
    icon: FiBookOpen,
  },
  {
    key: 'video',
    label: 'Video',
    title: 'Learn it from a coach',
    body: 'Scott and Krista teach each lesson on camera, the way they teach working actors.',
    img: '/course/step-video.jpg',
    alt: 'Coach Krista Scott teaching a lesson video',
    icon: FiPlayCircle,
  },
  {
    key: 'handout',
    label: 'Handouts',
    title: 'Keep the reference',
    body: 'Charts, templates and guides open right in the lesson and stay in your library.',
    img: '/course/step-handout.jpg',
    alt: 'The Expanded Lexical Sets handout open inside a lesson',
    icon: FiFileText,
  },
  {
    key: 'exercise',
    label: 'Exercises',
    title: 'Practice until it sticks',
    body: 'Interactive exercises check your ear and your transcription as you go.',
    img: '/course/step-exercise.jpg',
    alt: 'The Rhyming Words exercise with three pairs matched',
    icon: FiCheckSquare,
  },
]

const STEP_MS = 5000

/** Walks through the parts of a lesson, with a real screenshot for each. */
const LessonTour = () => {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const rowRef = useRef<HTMLDivElement>(null)

  // On phones the tabs scroll sideways: keep the active one in view without
  // moving the page itself.
  useEffect(() => {
    const row = rowRef.current
    const tab = row?.children[active] as HTMLElement | undefined
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2
    row.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
  }, [active, reduce])

  useEffect(() => {
    if (reduce || !auto) return
    const id = setTimeout(
      () => setActive((i) => (i + 1) % STEPS.length),
      STEP_MS,
    )
    return () => clearTimeout(id)
  }, [active, auto, reduce])

  const choose = (i: number) => {
    setAuto(false)
    setActive(i)
  }

  return (
    <Grid
      templateColumns={{ base: '1fr', lg: '320px 1fr' }}
      gap={{ base: 6, lg: 12 }}
      alignItems="center"
    >
      <Stack
        ref={rowRef}
        position="relative"
        spacing={2}
        role="tablist"
        aria-label="Parts of a lesson"
        direction={{ base: 'row', lg: 'column' }}
        overflowX={{ base: 'auto', lg: 'visible' }}
        mx={{ base: -4, lg: 0 }}
        px={{ base: 4, lg: 0 }}
        pb={{ base: 1, lg: 0 }}
        sx={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {STEPS.map((s, i) => {
          const on = i === active
          return (
            <Box
              key={s.key}
              as="button"
              role="tab"
              id={`tour-tab-${s.key}`}
              aria-selected={on}
              aria-controls="tour-panel"
              onClick={() => choose(i)}
              textAlign="left"
              flexShrink={0}
              position="relative"
              overflow="hidden"
              borderRadius="xl"
              px={{ base: 4, lg: 5 }}
              py={{ base: 2.5, lg: 4 }}
              bg={on ? 'white' : 'transparent'}
              borderWidth="1px"
              borderColor={on ? 'purple.100' : 'transparent'}
              boxShadow={on ? '0 14px 34px -20px rgba(30,20,70,0.45)' : 'none'}
              transition="background 0.25s, box-shadow 0.25s, border-color 0.25s"
              _hover={{ bg: on ? 'white' : 'whiteAlpha.700' }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: 'brand.purple',
                outlineOffset: '2px',
              }}
            >
              <Flex align="center" gap={3}>
                <Flex
                  w={{ base: 7, lg: 9 }}
                  h={{ base: 7, lg: 9 }}
                  borderRadius="lg"
                  align="center"
                  justify="center"
                  flexShrink={0}
                  bg={on ? 'brand.purple' : 'purple.50'}
                  color={on ? 'white' : 'brand.purple'}
                  transition="background 0.25s, color 0.25s"
                >
                  <Icon as={s.icon} boxSize={{ base: 3.5, lg: 4 }} />
                </Flex>
                <Box>
                  <Text
                    fontWeight="bold"
                    color={on ? 'gray.900' : 'gray.600'}
                    fontSize={{ base: 'sm', lg: 'md' }}
                    whiteSpace="nowrap"
                  >
                    <Box as="span" display={{ base: 'inline', lg: 'none' }}>
                      {s.label}
                    </Box>
                    <Box as="span" display={{ base: 'none', lg: 'inline' }}>
                      {s.title}
                    </Box>
                  </Text>
                  <Text
                    display={{ base: 'none', lg: 'block' }}
                    fontSize="sm"
                    color="gray.500"
                    mt={1}
                    lineHeight="1.55"
                  >
                    {s.body}
                  </Text>
                </Box>
              </Flex>
              {on && auto && !reduce && (
                <motion.div
                  key={`bar-${active}`}
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 3,
                    transformOrigin: '0% 50%',
                    background: 'linear-gradient(90deg, #723FC5, #5F53CF)',
                  }}
                />
              )}
            </Box>
          )
        })}
      </Stack>

      <Box>
        <BrowserFrame>
          <Box
            id="tour-panel"
            role="tabpanel"
            aria-labelledby={`tour-tab-${STEPS[active].key}`}
            position="absolute"
            inset={0}
          >
            {/* All four stay mounted and cross-fade, so a swap never waits on a download. */}
            {STEPS.map((s, i) => (
              <motion.img
                key={s.key}
                src={s.img}
                alt={i === active ? s.alt : ''}
                aria-hidden={i !== active}
                initial={false}
                animate={{
                  opacity: i === active ? 1 : 0,
                  scale: i === active ? 1 : 1.015,
                }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'left top',
                }}
              />
            ))}
          </Box>
        </BrowserFrame>
        <Text
          display={{ base: 'block', lg: 'none' }}
          mt={4}
          fontSize="sm"
          color="gray.600"
          lineHeight="1.6"
          minH="3.2em"
        >
          <Box as="span" fontWeight="bold" color="gray.900">
            {STEPS[active].title}.
          </Box>{' '}
          {STEPS[active].body}
        </Text>
      </Box>
    </Grid>
  )
}

export default LessonTour
