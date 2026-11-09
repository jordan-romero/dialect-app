import React from 'react'
import NextLink from 'next/link'
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FiAward, FiBookOpen, FiMail, FiMic, FiMap } from 'react-icons/fi'

// The finale on the course's last lesson, in place of the per-lesson
// "Lesson complete" slide: congratulations, then the two next steps the
// coaches offer — private coaching and a vote for the next dialect module.
// Both open an email to the studio, pre-filled so it says what it's about.

const EMAIL = 'info@actingaccents.com'
const mailto = (subject: string, body: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`

const DIALECTS = [
  'Cockney',
  'Southern American',
  'Irish',
  'Scottish',
  'New York',
  'Australian',
  'Standard American (for non-US actors)',
]

const LEARNED = [
  'The IPA',
  'Transcription',
  'Stress & prosody',
  'British RP',
  'Self-tape ready',
]

const CONFETTI_COLORS = ['#5F53CF', '#7EACE2', '#34D399', '#F6AD55', '#F687B3']

const fall = keyframes`
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(520px) rotate(540deg); opacity: 0; }
`
const riseIn = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`
const pop = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
`

// Deterministic pieces (no Math.random) so server and client render alike.
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 7) % 24) / 10,
  duration: 3.2 + ((i * 13) % 20) / 10,
  size: 6 + ((i * 5) % 6),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}))

const Confetti = () => (
  <Box
    position="absolute"
    inset={0}
    overflow="hidden"
    pointerEvents="none"
    aria-hidden
    sx={{ '@media (prefers-reduced-motion: reduce)': { display: 'none' } }}
  >
    {PIECES.map((p, i) => (
      <Box
        key={i}
        position="absolute"
        top={0}
        left={`${p.left}%`}
        w={`${p.size}px`}
        h={`${p.round ? p.size : p.size * 1.6}px`}
        bg={p.color}
        borderRadius={p.round ? 'full' : '2px'}
        opacity={0}
        animation={`${fall} ${p.duration}s ease-in ${p.delay}s 2 both`}
      />
    ))}
  </Box>
)

const NextStepCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) => (
  <Box
    bg="surface.card"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="xl"
    p={6}
    textAlign="left"
    boxShadow="sm"
  >
    <Flex
      align="center"
      justify="center"
      boxSize="44px"
      borderRadius="lg"
      bg="accent.subtle"
      color="brand.iris"
      mb={4}
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Heading size="md" mb={2}>
      {title}
    </Heading>
    {children}
  </Box>
)

const CourseComplete = () => (
  <Box position="relative" overflow="hidden">
    <Confetti />
    <Flex
      direction="column"
      align="center"
      textAlign="center"
      px={{ base: 5, md: 10 }}
      py={{ base: 8, md: 12 }}
      maxW="880px"
      mx="auto"
      position="relative"
      animation={`${riseIn} 0.6s cubic-bezier(0.22,1,0.36,1) both`}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="84px"
        borderRadius="full"
        bgGradient="linear(to-br, #7EACE2, #5F53CF)"
        boxShadow="0 14px 32px rgba(95,83,207,0.4)"
        color="white"
        mb={5}
        animation={`${pop} 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both`}
      >
        <Icon as={FiAward} boxSize={10} />
      </Flex>

      <Text
        fontSize="sm"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="widest"
        color="brand.iris"
        mb={2}
      >
        Course complete
      </Text>
      <Heading size="2xl" letterSpacing="-0.02em" mb={4}>
        Congratulations, you did it!
      </Heading>
      <Text fontSize="lg" color="text.muted" maxW="620px" mb={6}>
        From your first IPA symbol to transforming Hamlet&rsquo;s Advice into
        British RP, you now have a system for learning any dialect. Take a bow.
      </Text>

      <Wrap justify="center" spacing={2} mb={10}>
        {LEARNED.map((item) => (
          <WrapItem key={item}>
            <Box
              px={3}
              py={1}
              borderRadius="full"
              bg="surface.correct"
              color="green.700"
              _dark={{ color: 'green.200' }}
              fontSize="sm"
              fontWeight="semibold"
            >
              ✓ {item}
            </Box>
          </WrapItem>
        ))}
      </Wrap>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} w="100%" mb={10}>
        <NextStepCard icon={FiMic} title="Work one-on-one with us">
          <Text color="text.muted" mb={5}>
            Book private coaching with Scott or Krista for an audition, a role
            or the next dialect on your list.
          </Text>
          <Button
            as="a"
            href={mailto(
              'Private coaching',
              'Hi Scott and Krista,\n\nI just finished the course and would love to book private coaching.\n\nWhat I’m working on:\n',
            )}
            variant="brandBold"
            leftIcon={<Icon as={FiMail} />}
          >
            Book private coaching
          </Button>
        </NextStepCard>

        <NextStepCard icon={FiMap} title="Which dialect is next?">
          <Text color="text.muted" mb={4}>
            Tell us which dialect you want a module for next. Pick one or
            suggest your own.
          </Text>
          <Wrap spacing={2}>
            {DIALECTS.map((d) => (
              <WrapItem key={d}>
                <Button
                  as="a"
                  href={mailto(
                    `Dialect module request: ${d}`,
                    `Hi Scott and Krista,\n\nI'd love a module on ${d}.\n`,
                  )}
                  size="sm"
                  variant="brandWhite"
                  border="1px solid"
                  borderColor="brand.iris"
                >
                  {d}
                </Button>
              </WrapItem>
            ))}
            <WrapItem>
              <Button
                as="a"
                href={mailto(
                  'Dialect module request',
                  "Hi Scott and Krista,\n\nI'd love a module on:\n",
                )}
                size="sm"
                variant="brandGhost"
              >
                Something else…
              </Button>
            </WrapItem>
          </Wrap>
        </NextStepCard>
      </SimpleGrid>

      <Text color="text.muted" mb={3}>
        Keep every handout and recording close as you practice.
      </Text>
      <Button
        as={NextLink}
        href="/dashboard/resources"
        variant="brandWhite"
        border="1px solid"
        borderColor="brand.iris"
        leftIcon={<Icon as={FiBookOpen} />}
      >
        Open the Library
      </Button>
    </Flex>
  </Box>
)

export default CourseComplete
