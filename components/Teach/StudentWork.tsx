import React, { useMemo, useState } from 'react'
import NextLink from 'next/link'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Link,
  Skeleton,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { relative, shortDate, useJson } from './util'

type WorkEntry = {
  label?: string
  student: string | null
  expected: string | null
  matches?: boolean
}
type WorkQuestion = {
  id: number
  prompt: string
  entries: WorkEntry[]
  note?: string
  savedAt: string | null
}
type WorkQuiz = {
  id: number
  title: string | null
  quizType: string | null
  instructions: string | null
  submitted: boolean
  savedAt: string | null
  note?: string
  questions: WorkQuestion[]
}
type WorkLesson = {
  id: number
  title: string
  courseId: number
  courseTitle: string
  progress: number
  completed: boolean
  lastActive: string | null
  quizzes: WorkQuiz[]
}
type Resp = {
  cohort: { id: number; name: string }
  student: {
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    joinedAt: string
    usesSeat: boolean
  }
  lessons: WorkLesson[]
}

const TYPE_LABEL: Record<string, string> = {
  multipleChoice: 'Multiple choice',
  lineBuilder: 'Line builder',
  matching: 'Matching',
  shortAnswer: 'Short answer',
  dragAndDrop: 'Drag and drop',
  symbolPicker: 'Symbol picker',
  stressPlacement: 'Stress placement',
  lexicalChart: 'Lexical chart',
  consonantRect: 'Consonant rectangle',
  vowelQuad: 'Vowel chart',
  hangman: 'Transcription',
  buildAWord: 'Build-a-word',
  corrections: 'Corrections',
  repeatAfterMe: 'Repeat after me',
  buildDiphthongs: 'Build diphthongs',
}

const ipa = { fontFamily: 'ipa' }

const StudentWork = ({
  cohortId,
  studentId,
}: {
  cohortId: string
  studentId: string
}) => {
  const { data, error, loading } = useJson<Resp>(
    `/api/teach/cohorts/${cohortId}/students/${studentId}`,
  )
  const [onlyDone, setOnlyDone] = useState(true)

  const phases = useMemo(() => {
    const out: { courseId: number; title: string; lessons: WorkLesson[] }[] = []
    ;(data?.lessons || []).forEach((l) => {
      let p = out.find((x) => x.courseId === l.courseId)
      if (!p)
        out.push(
          (p = { courseId: l.courseId, title: l.courseTitle, lessons: [] }),
        )
      p.lessons.push(l)
    })
    return out
  }, [data])

  if (error)
    return (
      <Text p={8} color="red.500">
        {error}
      </Text>
    )
  if (loading && !data) {
    return (
      <Stack p={8} maxW="1100px" mx="auto" spacing={4}>
        <Skeleton h="40px" w="320px" />
        <Skeleton h="400px" />
      </Stack>
    )
  }
  if (!data) return null
  const s = data.student
  const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email
  const done = data.lessons.filter((l) => l.completed).length
  const exercises = data.lessons.reduce(
    (n, l) => n + l.quizzes.filter((q) => q.submitted).length,
    0,
  )

  return (
    <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <Link
        as={NextLink}
        href={`/teach/cohorts/${cohortId}`}
        color="text.muted"
        fontSize="sm"
        display="inline-flex"
        alignItems="center"
        gap={1}
      >
        <FiArrowLeft /> {data.cohort.name}
      </Link>
      <Flex
        mt={2}
        mb={6}
        justify="space-between"
        align="end"
        gap={4}
        wrap="wrap"
      >
        <Box>
          <Heading size="lg">{name}</Heading>
          <Text color="text.muted">
            {s.email} · joined {shortDate(s.joinedAt)}
          </Text>
          <Text mt={2} fontSize="sm">
            <b>{done}</b> of {data.lessons.length} lessons complete ·{' '}
            <b>{exercises}</b> exercises submitted
          </Text>
        </Box>
        <HStack>
          <Text fontSize="sm" color="text.muted">
            Only show lessons with work
          </Text>
          <Switch
            colorScheme="purple"
            isChecked={onlyDone}
            onChange={(e) => setOnlyDone(e.target.checked)}
          />
        </HStack>
      </Flex>

      <Stack spacing={8}>
        {phases.map((p) => {
          const lessons = onlyDone
            ? p.lessons.filter(
                (l) => l.progress > 0 || l.quizzes.some((q) => q.submitted),
              )
            : p.lessons
          if (lessons.length === 0) return null
          return (
            <Box key={p.courseId}>
              <Heading
                size="sm"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                {p.title}
              </Heading>
              <Accordion
                allowMultiple
                bg="surface.card"
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="lg"
                overflow="hidden"
              >
                {lessons.map((l) => (
                  <AccordionItem key={l.id} borderColor="border.subtle">
                    <AccordionButton py={3} _hover={{ bg: 'surface.hover' }}>
                      <Flex
                        flex="1"
                        textAlign="left"
                        align="center"
                        gap={3}
                        minW={0}
                      >
                        <Text fontWeight="semibold" noOfLines={1}>
                          {l.title}
                        </Text>
                        {l.completed ? (
                          <Badge colorScheme="green">Complete</Badge>
                        ) : l.progress > 0 ||
                          l.quizzes.some((q) => q.submitted) ? (
                          <Badge colorScheme="purple">In progress</Badge>
                        ) : (
                          <Badge>Not started</Badge>
                        )}
                      </Flex>
                      <Text
                        fontSize="xs"
                        color="text.muted"
                        mr={3}
                        display={{ base: 'none', md: 'block' }}
                      >
                        {l.quizzes.filter((q) => q.submitted).length}/
                        {l.quizzes.length} exercises · {relative(l.lastActive)}
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={5}>
                      {l.quizzes.length === 0 ? (
                        <Text color="text.muted" fontSize="sm">
                          No exercises in this lesson.
                        </Text>
                      ) : (
                        <Stack spacing={6}>
                          {l.quizzes.map((q, i) => (
                            <QuizBlock key={q.id} quiz={q} index={i} />
                          ))}
                        </Stack>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

const QuizBlock = ({ quiz, index }: { quiz: WorkQuiz; index: number }) => (
  <Box>
    <Flex align="baseline" gap={2} wrap="wrap" mb={2}>
      <Heading size="xs">{quiz.title || `Exercise ${index + 1}`}</Heading>
      <Text fontSize="xs" color="text.muted">
        {TYPE_LABEL[quiz.quizType || ''] || quiz.quizType}
      </Text>
      <Text fontSize="xs" color="text.muted" ml="auto">
        {quiz.submitted ? `Saved ${relative(quiz.savedAt)}` : 'Not submitted'}
      </Text>
    </Flex>
    {quiz.note && (
      <Text fontSize="sm" color="text.muted" mb={2}>
        {quiz.note}
      </Text>
    )}
    {!quiz.submitted ? null : (
      <Box
        overflowX="auto"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="md"
      >
        <Table size="sm">
          <Thead bg="surface.subtle">
            <Tr>
              <Th w="34%">Question</Th>
              <Th w="33%">Student entered</Th>
              <Th w="33%">Expected</Th>
            </Tr>
          </Thead>
          <Tbody>
            {quiz.questions.map((q) => {
              const rows = q.entries.length
                ? q.entries
                : [{ student: null, expected: null } as WorkEntry]
              return rows.map((e, i) => (
                <Tr key={`${q.id}-${i}`} verticalAlign="top">
                  {i === 0 && (
                    <Td
                      rowSpan={rows.length}
                      borderRightWidth="1px"
                      borderColor="border.subtle"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap" sx={ipa}>
                        {q.prompt}
                      </Text>
                      {q.note && (
                        <Text fontSize="xs" color="text.muted" mt={1}>
                          {q.note}
                        </Text>
                      )}
                    </Td>
                  )}
                  <Td>
                    {e.label && (
                      <Text fontSize="xs" color="text.muted" sx={ipa}>
                        {e.label}
                      </Text>
                    )}
                    {e.student === null ? (
                      <Text fontSize="sm" color="text.muted" fontStyle="italic">
                        {q.entries.length
                          ? 'Left blank'
                          : quiz.note
                          ? ''
                          : 'No answer'}
                      </Text>
                    ) : (
                      <HStack align="start" spacing={1}>
                        <Text fontSize="sm" whiteSpace="pre-wrap" sx={ipa}>
                          {e.student}
                        </Text>
                        {e.matches && (
                          <Tooltip label="Same as the expected answer">
                            <Box as="span" color="green.500" mt="3px">
                              <FiCheck />
                            </Box>
                          </Tooltip>
                        )}
                      </HStack>
                    )}
                  </Td>
                  <Td>
                    {e.expected === null ? (
                      <Text fontSize="sm" color="text.muted" fontStyle="italic">
                        {e.label ? 'Open-ended' : '—'}
                      </Text>
                    ) : (
                      <Text fontSize="sm" whiteSpace="pre-wrap" sx={ipa}>
                        {e.expected}
                      </Text>
                    )}
                  </Td>
                </Tr>
              ))
            })}
          </Tbody>
        </Table>
      </Box>
    )}
  </Box>
)

export default StudentWork
