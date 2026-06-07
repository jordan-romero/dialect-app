import React from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Tooltip,
  Icon,
  VStack,
  Spacer,
} from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { FiPlayCircle, FiFileText, FiEdit3 } from 'react-icons/fi'
import { IconType } from 'react-icons'
import { Lesson } from '../Course/courseTypes'
import { buildLessonOutline, OutlineItem } from './lessonOutline'

type LessonDescriptionProps = {
  lesson: Lesson
}

const STEP_META: Record<
  OutlineItem['type'],
  { icon: IconType; bg: string; fg: string; label: string }
> = {
  video: {
    icon: FiPlayCircle,
    bg: 'purple.50',
    fg: 'brand.iris',
    label: 'Video',
  },
  resource: {
    icon: FiFileText,
    bg: 'blue.50',
    fg: 'blue.500',
    label: 'Resource',
  },
  quiz: { icon: FiEdit3, bg: 'green.50', fg: 'green.500', label: 'Exercise' },
}

const LessonDescription = ({ lesson }: LessonDescriptionProps) => {
  const outline = buildLessonOutline(lesson)

  return (
    <Flex
      align="center"
      h="100%"
      px={{ base: 6, md: 12 }}
      gap={{ base: 8, lg: 12 }}
      direction={{ base: 'column', lg: 'row' }}
    >
      <Box flex="1" maxW="600px" w="100%">
        <Flex align="center" gap={2} mb={3}>
          <Heading size="lg" letterSpacing="-0.02em">
            Lesson Description
          </Heading>
          <Tooltip
            label="Work top to bottom: watch the video first, then complete each item in order."
            fontSize="sm"
            placement="top"
            hasArrow
            borderRadius="md"
            px={3}
            py={2}
          >
            <Icon
              as={InfoOutlineIcon}
              w={5}
              h={5}
              color="gray.400"
              cursor="help"
            />
          </Tooltip>
        </Flex>

        <Text color="gray.600" fontSize="md" lineHeight="1.7" mb={7}>
          {lesson.description}
        </Text>

        {outline.length > 0 && (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="gray.400"
              mb={3}
            >
              In this lesson
            </Text>
            <VStack align="stretch" spacing={2}>
              {outline.map((item, index) => {
                const meta = STEP_META[item.type]
                return (
                  <Flex
                    key={`${index}-${item.label}`}
                    align="center"
                    gap={3}
                    p={3}
                    borderRadius="xl"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.100"
                    transition="transform 0.12s ease, box-shadow 0.12s ease"
                    _hover={{ transform: 'translateX(2px)', boxShadow: 'sm' }}
                  >
                    <Flex
                      align="center"
                      justify="center"
                      boxSize={9}
                      borderRadius="lg"
                      bg={meta.bg}
                      color={meta.fg}
                      flexShrink={0}
                    >
                      <Icon as={meta.icon} boxSize={5} />
                    </Flex>
                    <Text fontWeight="medium" color="gray.800" noOfLines={1}>
                      {item.label}
                    </Text>
                    <Spacer />
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      flexShrink={0}
                      display={{ base: 'none', sm: 'block' }}
                    >
                      {meta.label}
                    </Text>
                  </Flex>
                )
              })}
            </VStack>
          </Box>
        )}
      </Box>

      <Box
        flex="1"
        display="flex"
        justifyContent="center"
        w="100%"
        maxW="480px"
      >
        <Image
          src="./descriptionIllustration.svg"
          alt="Lesson overview"
          w="100%"
        />
      </Box>
    </Flex>
  )
}

export default LessonDescription
