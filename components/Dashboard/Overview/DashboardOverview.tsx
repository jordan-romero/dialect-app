import React, { useEffect, useState } from 'react'
import NextLink from 'next/link'
import {
  Box,
  Flex,
  SimpleGrid,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Icon,
  Badge as ChakraBadge,
  Skeleton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiLock, FiArrowRight } from 'react-icons/fi'
import { MdLocalFireDepartment } from 'react-icons/md'
import { keyframes } from '@emotion/react'
import { visualFor } from '../badgeVisuals'
import WelcomeHeader from '../WelcomeHeader'

// Flames lick up from the bottom of the streak card when it ignites.
const flicker = keyframes`
  0%, 100% { transform: translateY(0) scaleY(1) rotate(-2deg); opacity: 0.85; }
  50% { transform: translateY(-8px) scaleY(1.3) rotate(2deg); opacity: 1; }
`
const emberGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 0 0 0 rgba(249,115,22,0); }
  50% { box-shadow: 0 0 0 3px rgba(249,115,22,0.35), 0 0 30px 6px rgba(249,115,22,0.5); }
`

interface Phase {
  id: number
  title: string
  unlocked: boolean
  total: number
  completed: number
}
interface Badge {
  id: string
  emoji: string
  label: string
  hint: string
  earned: boolean
  count?: number
}
interface Overview {
  continue: {
    lessonId: number
    title: string
    moduleNumber: number | null
    phase: string
    done: boolean
  } | null
  overall: { completed: number; total: number; pct: number }
  phases: Phase[]
  streak: { current: number; best: number }
  badges: Badge[]
}

const Card: React.FC<{ children: React.ReactNode } & Record<string, any>> = ({
  children,
  ...props
}) => {
  const bg = useColorModeValue('white', 'gray.800')
  const border = useColorModeValue('gray.100', 'whiteAlpha.200')
  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="2xl"
      boxShadow="sm"
      p={6}
      {...props}
    >
      {children}
    </Box>
  )
}

const BadgeMedallion: React.FC<{ badge: Badge }> = ({ badge }) => {
  const visual = visualFor(badge.id)
  const lockedDisc = useColorModeValue('gray.100', 'whiteAlpha.200')
  const lockedIcon = useColorModeValue('gray.400', 'whiteAlpha.500')
  const lockChipBg = useColorModeValue('white', 'gray.800')
  const subtle = useColorModeValue('gray.500', 'gray.400')

  return (
    <Popover
      trigger="hover"
      placement="top"
      openDelay={100}
      closeDelay={80}
      isLazy
    >
      <PopoverTrigger>
        <VStack
          as="button"
          spacing={2}
          cursor="pointer"
          transition="transform 0.15s ease"
          _hover={{ transform: 'translateY(-3px)' }}
        >
          <Flex
            align="center"
            justify="center"
            boxSize="64px"
            borderRadius="full"
            position="relative"
            bgGradient={badge.earned ? visual.grad : undefined}
            bg={badge.earned ? undefined : lockedDisc}
            boxShadow={
              badge.earned ? '0 8px 20px rgba(95,83,207,0.25)' : 'none'
            }
          >
            <Icon
              as={visual.icon}
              boxSize={7}
              color={badge.earned ? 'white' : lockedIcon}
            />
            {!badge.earned && (
              <Flex
                position="absolute"
                bottom="-2px"
                right="-2px"
                boxSize="22px"
                borderRadius="full"
                bg={lockChipBg}
                align="center"
                justify="center"
                boxShadow="sm"
              >
                <Icon as={FiLock} boxSize={3} color={lockedIcon} />
              </Flex>
            )}
            {badge.earned && (badge.count ?? 1) > 1 && (
              <Flex
                position="absolute"
                bottom="-3px"
                right="-3px"
                minW="22px"
                h="22px"
                px="5px"
                borderRadius="full"
                bg="gray.900"
                color="white"
                align="center"
                justify="center"
                fontSize="11px"
                fontWeight="bold"
                border="2px solid"
                borderColor={lockChipBg}
              >
                ×{badge.count}
              </Flex>
            )}
          </Flex>
          <Text
            fontSize="xs"
            fontWeight="medium"
            textAlign="center"
            noOfLines={2}
            opacity={badge.earned ? 1 : 0.6}
            maxW="84px"
          >
            {badge.label}
          </Text>
        </VStack>
      </PopoverTrigger>
      <PopoverContent w="250px">
        <PopoverArrow />
        <PopoverBody>
          <HStack spacing={3} align="flex-start">
            <Flex
              align="center"
              justify="center"
              boxSize="38px"
              borderRadius="full"
              flexShrink={0}
              bgGradient={badge.earned ? visual.grad : undefined}
              bg={badge.earned ? undefined : lockedDisc}
            >
              <Icon
                as={visual.icon}
                boxSize={4}
                color={badge.earned ? 'white' : lockedIcon}
              />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                {badge.label}
              </Text>
              <Text fontSize="xs" color={subtle} mt={0.5}>
                {badge.hint}
              </Text>
              <HStack spacing={2} mt={2}>
                <ChakraBadge colorScheme={badge.earned ? 'green' : 'gray'}>
                  {badge.earned ? 'Earned' : 'Locked'}
                </ChakraBadge>
                {badge.earned && (badge.count ?? 1) > 1 && (
                  <ChakraBadge colorScheme="purple">×{badge.count}</ChakraBadge>
                )}
              </HStack>
            </Box>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const ContinueHero: React.FC<{ data: Overview }> = ({ data }) => {
  const c = data.continue
  const allDone =
    data.overall.total > 0 && data.overall.completed === data.overall.total
  return (
    <Box
      bgGradient="linear(to-r, #5F53CF, #7EACE2)"
      color="white"
      borderRadius="2xl"
      p={{ base: 6, md: 8 }}
      boxShadow="0 12px 40px rgba(95,83,207,0.35)"
    >
      <Heading size={{ base: 'lg', md: 'xl' }} mb={2}>
        {allDone ? 'All caught up' : "Let's pick up where you left off"}
      </Heading>
      <Text fontSize="md" opacity={0.9} mb={5}>
        {allDone
          ? "You've completed the course"
          : c?.title
          ? c.moduleNumber
            ? `Module ${c.moduleNumber}: ${c.title}`
            : c.title
          : 'Start your first lesson'}
      </Text>
      <Button
        as={NextLink}
        href="/dashboard"
        variant="brandWhite"
        rightIcon={<FiArrowRight />}
      >
        {allDone ? 'Review lessons' : 'Continue'}
      </Button>
    </Box>
  )
}

const ProgressCard: React.FC<{ data: Overview }> = ({ data }) => {
  const subtle = useColorModeValue('gray.500', 'gray.400')
  const track = useColorModeValue('gray.100', 'whiteAlpha.200')
  return (
    <Card>
      <Heading size="md" mb={4}>
        Your progress
      </Heading>
      <Flex gap={6} align="center" wrap="wrap">
        <CircularProgress
          value={data.overall.pct}
          size="96px"
          thickness="8px"
          color="brand.iris"
          trackColor={track}
        >
          <CircularProgressLabel fontWeight="bold">
            {data.overall.pct}%
          </CircularProgressLabel>
        </CircularProgress>
        <Box flex="1" minW="220px">
          <Text fontSize="sm" color={subtle} mb={3}>
            {data.overall.completed} of {data.overall.total} lessons complete
          </Text>
          <VStack align="stretch" spacing={3}>
            {data.phases.map((p) => (
              <Box key={p.id}>
                <Flex justify="space-between" mb={1}>
                  <HStack spacing={1}>
                    {!p.unlocked && (
                      <Icon as={FiLock} boxSize={3} color={subtle} />
                    )}
                    <Text fontSize="sm" fontWeight="medium">
                      {p.title}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={subtle}>
                    {p.completed}/{p.total}
                  </Text>
                </Flex>
                <Progress
                  value={p.total ? (p.completed / p.total) * 100 : 0}
                  size="sm"
                  borderRadius="full"
                  colorScheme="purple"
                  opacity={p.unlocked ? 1 : 0.5}
                />
              </Box>
            ))}
          </VStack>
        </Box>
      </Flex>
    </Card>
  )
}

const StreakCard: React.FC<{ data: Overview }> = ({ data }) => {
  const subtle = useColorModeValue('gray.500', 'gray.400')
  const { current, best } = data.streak
  const [igniting, setIgniting] = useState(false)
  const [displayCount, setDisplayCount] = useState(current)

  // Ignite (flames + count-up) only when the streak has gone UP since last seen.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = 'aa:lastStreakSeen'
    const prev = Number(window.localStorage.getItem(key) || '0')
    window.localStorage.setItem(key, String(current))
    if (current > prev && current > 0) {
      setIgniting(true)
      let n = prev
      setDisplayCount(prev)
      const iv = setInterval(() => {
        n += 1
        setDisplayCount(n)
        if (n >= current) clearInterval(iv)
      }, 180)
      const t = setTimeout(() => setIgniting(false), 4200)
      return () => {
        clearInterval(iv)
        clearTimeout(t)
      }
    }
    setDisplayCount(current)
  }, [current])

  return (
    <Card
      display="flex"
      flexDirection="column"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      h={{ base: 'auto', lg: '85%' }}
      minH="fit-content"
      animation={
        igniting ? `${emberGlow} 1.2s ease-in-out infinite` : undefined
      }
    >
      <Heading size="md" mb={3}>
        Streak
      </Heading>
      <HStack spacing={4}>
        <Flex
          align="center"
          justify="center"
          boxSize="56px"
          borderRadius="full"
          bgGradient="linear(to-br, #F97316, #EF4444)"
          boxShadow="0 8px 20px rgba(239,68,68,0.3)"
        >
          <Icon
            as={MdLocalFireDepartment}
            boxSize={7}
            color="white"
            animation={
              igniting ? `${flicker} 0.5s ease-in-out infinite` : undefined
            }
          />
        </Flex>
        <Box>
          <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
            {igniting ? displayCount : current}
          </Text>
          <Text fontSize="sm" color={subtle}>
            day{current === 1 ? '' : 's'} in a row
          </Text>
        </Box>
      </HStack>
      <Text fontSize="xs" color={subtle} mt={3}>
        {current === 0
          ? 'Do a lesson today to start a streak!'
          : `Best: ${best} day${best === 1 ? '' : 's'}`}
      </Text>
    </Card>
  )
}

const Achievements: React.FC<{ data: Overview }> = ({ data }) => {
  const subtle = useColorModeValue('gray.500', 'gray.400')
  const earnedCount = data.badges.filter((b) => b.earned).length
  return (
    <Card>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="md">Achievements</Heading>
        <Text fontSize="sm" color={subtle}>
          {earnedCount}/{data.badges.length} earned
        </Text>
      </Flex>
      <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacingY={6} spacingX={4}>
        {data.badges.map((b) => (
          <BadgeMedallion key={b.id} badge={b} />
        ))}
      </SimpleGrid>
    </Card>
  )
}

const OverviewSkeleton = () => (
  <VStack align="stretch" spacing={6}>
    <Skeleton height="150px" borderRadius="2xl" />
    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
      <Skeleton
        height="200px"
        borderRadius="2xl"
        gridColumn={{ lg: 'span 2' }}
      />
      <Skeleton height="200px" borderRadius="2xl" />
    </SimpleGrid>
    <Skeleton height="180px" borderRadius="2xl" />
  </VStack>
)

const DashboardOverview = () => {
  const [data, setData] = useState<Overview | null>(null)
  const pageBg = useColorModeValue('gray.50', 'gray.900')
  const pageColor = useColorModeValue('gray.800', 'gray.100')

  useEffect(() => {
    fetch('/api/overview')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch((e) => console.error('Error loading overview:', e))
  }, [])

  return (
    <Box
      bg={pageBg}
      color={pageColor}
      minH="100%"
      px={{ base: 4, md: 6 }}
      py={6}
    >
      <Box maxW="1100px" mx="auto">
        <WelcomeHeader />

        {!data ? (
          <OverviewSkeleton />
        ) : (
          <VStack align="stretch" spacing={6}>
            <ContinueHero data={data} />
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <Box gridColumn={{ lg: 'span 2' }}>
                <ProgressCard data={data} />
              </Box>
              <StreakCard data={data} />
            </SimpleGrid>
            <Achievements data={data} />
          </VStack>
        )}
      </Box>
    </Box>
  )
}

export default DashboardOverview
