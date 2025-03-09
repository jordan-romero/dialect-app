import React, { useState } from 'react'
import {
  Box,
  Text,
  Image,
  VStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { ExternalLinkIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Resource } from '../Course/courseTypes'

type LessonOutroProps = {
  resources: Resource[]
}

const LessonOutro = ({ resources }: LessonOutroProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const completionIllustration = './completionIllustration.svg'

  const cardBg = useColorModeValue('white', 'gray.700')
  const previewBg = useColorModeValue('gray.50', 'gray.600')

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={6}>
      <VStack spacing={6} textAlign="center" mb={8}>
        <Text fontSize="3xl" fontWeight="bold" color="green.500">
          Lesson Complete! 🎉
        </Text>
        <Image
          src={completionIllustration}
          alt="Completion Illustration"
          boxSize="200px"
        />
        <Text fontSize="xl" fontWeight="semibold">
          Module Resources:
        </Text>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={6}
        w="full"
        maxW="6xl"
      >
        {resources.map((resource) => (
          <Card
            key={resource.id}
            bg={cardBg}
            shadow="md"
            transition="all 0.3s"
            gridColumn={
              expandedId === resource.id
                ? {
                    base: 'span 1',
                    md: 'span 2',
                    lg: 'span 3',
                  }
                : 'auto'
            }
          >
            <CardHeader
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={4}
            >
              <Text fontSize="lg" fontWeight="semibold">
                {resource.name}
              </Text>
              <Box display="flex" gap={2}>
                <Link href={resource.url} isExternal>
                  <IconButton
                    aria-label="Open resource"
                    icon={<ExternalLinkIcon />}
                    size="sm"
                    variant="ghost"
                  />
                </Link>
                <IconButton
                  aria-label={
                    expandedId === resource.id ? 'Hide preview' : 'Show preview'
                  }
                  icon={
                    expandedId === resource.id ? <ViewOffIcon /> : <ViewIcon />
                  }
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setExpandedId(
                      expandedId === resource.id ? null : resource.id,
                    )
                  }
                />
              </Box>
            </CardHeader>

            {expandedId === resource.id && (
              <CardBody p={4}>
                <Box
                  bg={previewBg}
                  borderRadius="lg"
                  overflow="hidden"
                  h="24rem"
                >
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                      resource.url,
                    )}&embedded=true`}
                    width="100%"
                    height="100%"
                    style={{
                      border: 'none',
                    }}
                    title={resource.name}
                  />
                </Box>
              </CardBody>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default LessonOutro
