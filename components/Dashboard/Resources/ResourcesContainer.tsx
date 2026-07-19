import React, { useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Badge,
  Button,
  SimpleGrid,
  VStack,
  Skeleton,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiFileText,
  FiHeadphones,
  FiLink,
  FiFile,
  FiLock,
  FiExternalLink,
} from 'react-icons/fi'

interface Resource {
  id: number
  name: string
  type: string
  order: number
  url: string | null
}
interface Lesson {
  id: number
  title: string
  displayOrder: number | null
  locked: boolean
  lockReason: 'phase' | 'paid' | null
  resources: Resource[]
}
interface Phase {
  id: number
  title: string
  unlocked: boolean
  lessons: Lesson[]
}

type Kind = 'pdf' | 'audio' | 'link' | 'doc'

const kindOf = (r: Resource): Kind => {
  const t = (r.type || '').toLowerCase()
  const url = r.url || ''
  if (t === 'link') return 'link'
  if (t === 'mp3' || /\.(mp3|wav|m4a|ogg)(\?|$)/i.test(url)) return 'audio'
  if (t === 'pdf' || /\.pdf(\?|$)/i.test(url)) return 'pdf'
  return 'doc'
}

const KIND_META: Record<Kind, { icon: typeof FiFile; label: string }> = {
  pdf: { icon: FiFileText, label: 'PDF' },
  audio: { icon: FiHeadphones, label: 'Audio' },
  link: { icon: FiLink, label: 'Link' },
  doc: { icon: FiFile, label: 'Doc' },
}

const ResourceCard: React.FC<{ resource: Resource; locked: boolean }> = ({
  resource,
  locked,
}) => {
  const kind = kindOf(resource)
  const meta = KIND_META[kind]
  const cardBg = useColorModeValue('white', 'gray.800')
  const lockedBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const iconBg = useColorModeValue('purple.50', 'whiteAlpha.200')

  return (
    <Flex
      direction="column"
      gap={3}
      p={4}
      borderRadius="xl"
      border="1px solid"
      borderColor={cardBorder}
      bg={locked ? lockedBg : cardBg}
      opacity={locked ? 0.7 : 1}
      boxShadow="sm"
      transition="box-shadow 0.15s ease, transform 0.15s ease"
      _hover={locked ? {} : { boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Flex align="center" gap={3}>
        <Flex
          align="center"
          justify="center"
          boxSize={9}
          borderRadius="lg"
          bg={locked ? 'gray.200' : iconBg}
          color={locked ? 'gray.500' : 'brand.iris'}
          flexShrink={0}
        >
          <Icon as={locked ? FiLock : meta.icon} boxSize={5} />
        </Flex>
        <Box minW={0}>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
            {resource.name}
          </Text>
          <Badge
            colorScheme={locked ? 'gray' : 'purple'}
            fontSize="0.65rem"
            mt={1}
          >
            {meta.label}
          </Badge>
        </Box>
      </Flex>

      {!locked && kind === 'audio' && resource.url && (
        <audio controls src={resource.url} style={{ width: '100%' }} />
      )}

      {!locked && kind !== 'audio' && resource.url && (
        <Button
          as={ChakraLink}
          href={resource.url}
          isExternal
          size="sm"
          variant="brandWhite"
          rightIcon={<FiExternalLink />}
          alignSelf="flex-start"
          _hover={{ textDecoration: 'none' }}
        >
          Open
        </Button>
      )}
    </Flex>
  )
}

const PhaseSection: React.FC<{ phase: Phase }> = ({ phase }) => {
  const headingColor = useColorModeValue('gray.800', 'gray.100')
  const lockedBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const lockedBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  return (
    <Box>
      <Flex align="center" gap={3} mb={4}>
        <Heading as="h2" size="md" color={headingColor}>
          {phase.title}
        </Heading>
        {!phase.unlocked && (
          <Badge
            colorScheme="gray"
            display="flex"
            alignItems="center"
            gap={1}
            px={2}
            py={1}
            borderRadius="full"
          >
            <Icon as={FiLock} boxSize={3} /> Locked
          </Badge>
        )}
      </Flex>

      {!phase.unlocked ? (
        <Flex
          align="center"
          gap={3}
          p={5}
          borderRadius="xl"
          bg={lockedBg}
          border="1px dashed"
          borderColor={lockedBorder}
          color="gray.500"
        >
          <Icon as={FiLock} boxSize={5} />
          <Text fontSize="sm">
            Finish the previous phase to unlock these resources.
          </Text>
        </Flex>
      ) : (
        <VStack align="stretch" spacing={6}>
          {phase.lessons.map((lesson) => (
            <Box key={lesson.id}>
              <Flex align="center" gap={2} mb={3}>
                <Text fontWeight="bold" color="brand.iris">
                  {lesson.displayOrder
                    ? `${lesson.displayOrder}. ${lesson.title}`
                    : lesson.title}
                </Text>
                {lesson.locked && lesson.lockReason === 'paid' && (
                  <Badge colorScheme="purple" variant="subtle">
                    Unlock with full course
                  </Badge>
                )}
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                {lesson.resources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    locked={lesson.locked}
                  />
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
}

const LibrarySkeleton: React.FC = () => (
  <VStack align="stretch" spacing={8}>
    {[0, 1].map((s) => (
      <Box key={s}>
        <Skeleton height="24px" width="180px" mb={4} borderRadius="md" />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="96px" borderRadius="xl" />
          ))}
        </SimpleGrid>
      </Box>
    ))}
  </VStack>
)

const ResourcesContainer = () => {
  const [phases, setPhases] = useState<Phase[] | null>(null)
  const pageBg = useColorModeValue('white', 'gray.900')
  const pageColor = useColorModeValue('gray.800', 'gray.100')
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')

  useEffect(() => {
    fetch('/api/library')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPhases(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error('Error fetching library:', e)
        setPhases([])
      })
  }, [])

  return (
    <Box
      bg={pageBg}
      color={pageColor}
      minH="100vh"
      px={{ base: 4, md: 6 }}
      py={6}
    >
      <Box maxW="1200px" mx="auto">
        <Heading size="lg" mb={1}>
          Library
        </Heading>
        <Text color={subtitleColor} mb={8}>
          All your course handouts, audio, and references — organized by phase.
        </Text>

        {phases === null ? (
          <LibrarySkeleton />
        ) : phases.length === 0 ? (
          <Text color="gray.500">No resources available yet.</Text>
        ) : (
          <VStack align="stretch" spacing={10}>
            {phases.map((phase) => (
              <PhaseSection key={phase.id} phase={phase} />
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  )
}

export default ResourcesContainer
