import React, { useState } from 'react'
import NextLink from 'next/link'
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Button,
  IconButton,
  Icon,
  Link as ChakraLink,
  Badge,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import {
  FiCheck,
  FiBookOpen,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiHeadphones,
  FiLink,
  FiFile,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { Resource } from '../Course/courseTypes'
import IframeWithSkeleton from './IframeWithSkeleton'

type LessonOutroProps = {
  resources: Resource[]
}

const riseIn = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`
const pop = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
`

type Kind = 'pdf' | 'audio' | 'link' | 'doc'
const kindOf = (r: Resource): Kind => {
  const t = (r.type || '').toLowerCase()
  const url = r.url || ''
  if (t === 'link') return 'link'
  if (t === 'mp3' || /\.(mp3|wav|m4a|ogg)(\?|$)/i.test(url)) return 'audio'
  if (t === 'pdf' || /\.pdf(\?|$)/i.test(url)) return 'pdf'
  return 'doc'
}
const KIND_META: Record<Kind, { icon: IconType; label: string }> = {
  pdf: { icon: FiFileText, label: 'PDF' },
  audio: { icon: FiHeadphones, label: 'Audio' },
  link: { icon: FiLink, label: 'Link' },
  doc: { icon: FiFile, label: 'Doc' },
}

const LessonOutro = ({ resources }: LessonOutroProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <Flex
      direction="column"
      align="center"
      p={{ base: 6, md: 10 }}
      animation={`${riseIn} 0.5s cubic-bezier(0.22,1,0.36,1) both`}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="72px"
        borderRadius="full"
        bgGradient="linear(to-br, #34D399, #10B981)"
        boxShadow="0 12px 28px rgba(16,185,129,0.35)"
        mb={4}
        animation={`${pop} 0.5s ease-out`}
      >
        <Icon as={FiCheck} boxSize={9} color="white" />
      </Flex>

      <Heading size="lg" letterSpacing="-0.02em" mb={2}>
        Lesson complete
      </Heading>
      <Image
        src="./completionIllustration.svg"
        alt="Lesson complete"
        boxSize="170px"
        my={2}
      />
      <Text color="gray.600" maxW="440px" textAlign="center" mb={5}>
        Nice work! Keep these resources handy as you practice.
      </Text>
      <Button
        as={NextLink}
        href="/dashboard/resources"
        leftIcon={<FiBookOpen />}
        variant="brandBold"
        mb={resources.length > 0 ? 10 : 0}
      >
        Open the Library
      </Button>

      {resources.length > 0 && (
        <Box w="full" maxW="5xl">
          <Text
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="gray.400"
            mb={4}
            textAlign="center"
          >
            Module resources
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {resources.map((resource) => {
              const meta = KIND_META[kindOf(resource)]
              const expanded = expandedId === resource.id
              return (
                <Flex
                  key={resource.id}
                  direction="column"
                  gap={3}
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="white"
                  boxShadow="sm"
                  gridColumn={
                    expanded
                      ? { base: 'auto', md: 'span 2', lg: 'span 3' }
                      : 'auto'
                  }
                >
                  <Flex align="center" gap={3}>
                    <Flex
                      align="center"
                      justify="center"
                      boxSize={9}
                      borderRadius="lg"
                      bg="purple.50"
                      color="brand.iris"
                      flexShrink={0}
                    >
                      <Icon as={meta.icon} boxSize={5} />
                    </Flex>
                    <Box minW={0} flex="1">
                      <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                        {resource.name}
                      </Text>
                      <Badge colorScheme="purple" fontSize="0.65rem" mt={1}>
                        {meta.label}
                      </Badge>
                    </Box>
                    <ChakraLink href={resource.url} isExternal>
                      <IconButton
                        aria-label="Open resource"
                        icon={<FiExternalLink />}
                        size="sm"
                        variant="ghost"
                      />
                    </ChakraLink>
                    <IconButton
                      aria-label={expanded ? 'Hide preview' : 'Show preview'}
                      icon={expanded ? <FiEyeOff /> : <FiEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId(expanded ? null : resource.id)
                      }
                    />
                  </Flex>

                  {expanded && (
                    <IframeWithSkeleton
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        resource.url,
                      )}&embedded=true`}
                      title={resource.name}
                      width="100%"
                      height="24rem"
                    />
                  )}
                </Flex>
              )
            })}
          </SimpleGrid>
        </Box>
      )}
    </Flex>
  )
}

export default LessonOutro
