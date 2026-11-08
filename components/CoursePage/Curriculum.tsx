import React, { useState } from 'react'
import {
  Box,
  Collapse,
  Flex,
  Grid,
  Icon,
  Stack,
  Tag,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { FiFlag } from 'react-icons/fi'
import { PHASES, OutlineLesson } from './courseOutline'
import { Reveal } from '../PrelaunchHomePage/motion'

const LessonRow = ({
  lesson,
  n,
}: {
  lesson: OutlineLesson
  n: number | null
}) => (
  <Flex
    gap={{ base: 3, md: 4 }}
    py={{ base: 4, md: 5 }}
    borderTopWidth="1px"
    borderColor="gray.100"
    align="flex-start"
  >
    <Flex
      w={{ base: 8, md: 9 }}
      h={{ base: 8, md: 9 }}
      flexShrink={0}
      borderRadius="full"
      align="center"
      justify="center"
      fontWeight="bold"
      fontSize="sm"
      bg={lesson.checkpoint ? 'brand.purple' : 'purple.50'}
      color={lesson.checkpoint ? 'white' : 'brand.purple'}
      aria-hidden
    >
      {lesson.checkpoint ? <Icon as={FiFlag} boxSize={4} /> : n}
    </Flex>
    <Box flex={1} minW={0}>
      <Flex align="center" gap={2} wrap="wrap">
        <Text
          fontWeight="bold"
          color="gray.900"
          fontSize={{ base: 'md', md: 'lg' }}
        >
          {lesson.title}
        </Text>
        {lesson.free && (
          <Tag
            size="sm"
            borderRadius="full"
            bg="#E3FBF8"
            color="#0F766E"
            fontWeight="bold"
          >
            Free preview
          </Tag>
        )}
      </Flex>
      <Text
        color="gray.600"
        fontSize={{ base: 'sm', md: 'md' }}
        mt={1}
        lineHeight="1.6"
      >
        {lesson.summary}
      </Text>
      {lesson.exercises && (
        <Wrap spacing={2} mt={3}>
          {lesson.exercises.map((e, i) => (
            <WrapItem key={`${e}-${i}`}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.600"
                bg="gray.50"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                px={2}
                py={0.5}
              >
                {e}
              </Text>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  </Flex>
)

/** The three phases, each opening to show its lessons and exercises. */
const Curriculum = () => {
  const [open, setOpen] = useState<number[]>([0])
  const toggle = (i: number) =>
    setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))

  let lessonNumber = 0

  return (
    <Stack spacing={{ base: 4, md: 5 }}>
      {PHASES.map((phase, i) => {
        const isOpen = open.includes(i)
        const lessons = phase.lessons.filter((l) => !l.checkpoint).length
        const exercises = phase.lessons.reduce(
          (n, l) => n + (l.exercises?.length ?? 0),
          0,
        )
        const rows = phase.lessons.map((l) => ({
          lesson: l,
          n: l.checkpoint ? null : ++lessonNumber,
        }))
        return (
          <Reveal key={phase.name} delay={i * 0.06}>
            <Box
              bg="white"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={isOpen ? 'purple.100' : 'gray.100'}
              boxShadow={
                isOpen
                  ? '0 2px 4px rgba(17,24,39,0.04), 0 30px 60px -38px rgba(30,20,70,0.4)'
                  : '0 1px 2px rgba(17,24,39,0.04)'
              }
              transition="box-shadow 0.3s, border-color 0.3s"
              overflow="hidden"
            >
              <Box
                as="button"
                type="button"
                w="100%"
                textAlign="left"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`phase-${i}`}
                px={{ base: 5, md: 8 }}
                py={{ base: 5, md: 6 }}
                _hover={{ bg: 'gray.50' }}
                _focusVisible={{
                  outline: '2px solid',
                  outlineColor: 'brand.purple',
                  outlineOffset: '-2px',
                }}
                transition="background 0.2s"
              >
                <Grid templateColumns="1fr auto" gap={4} alignItems="center">
                  <Box minW={0}>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="0.14em"
                      textTransform="uppercase"
                      color="brand.purple"
                    >
                      {phase.name} · {lessons} lessons · {exercises} exercises
                    </Text>
                    <Text
                      mt={1.5}
                      fontWeight="black"
                      fontSize={{ base: 'xl', md: '2xl' }}
                      letterSpacing="-0.02em"
                      color="gray.900"
                    >
                      {phase.title}
                    </Text>
                    <Text
                      mt={1.5}
                      color="gray.600"
                      fontSize={{ base: 'sm', md: 'md' }}
                      lineHeight="1.6"
                    >
                      {phase.blurb}
                    </Text>
                  </Box>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    bg={isOpen ? 'brand.purple' : 'purple.50'}
                    color={isOpen ? 'white' : 'brand.purple'}
                    transition="background 0.25s, color 0.25s"
                    flexShrink={0}
                  >
                    <ChevronDownIcon
                      boxSize={6}
                      transform={isOpen ? 'rotate(180deg)' : 'none'}
                      transition="transform 0.3s"
                    />
                  </Flex>
                </Grid>
              </Box>
              <Collapse in={isOpen} animateOpacity>
                <Box
                  id={`phase-${i}`}
                  px={{ base: 5, md: 8 }}
                  pb={{ base: 2, md: 3 }}
                >
                  {rows.map(({ lesson, n }) => (
                    <LessonRow key={lesson.title} lesson={lesson} n={n} />
                  ))}
                </Box>
              </Collapse>
            </Box>
          </Reveal>
        )
      })}
    </Stack>
  )
}

export default Curriculum
