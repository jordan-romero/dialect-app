import React from 'react'
import {
  Box,
  Text,
  Image,
  Link as ChakraLink,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { Resource } from '../Course/courseTypes'
import Link from 'next/link'
import { InfoOutlineIcon } from '@chakra-ui/icons'

type LessonDescriptionProps = {
  lessonDescription: string
  resources: Resource[]
}

const LessonDescription = ({
  lessonDescription,
  resources,
}: LessonDescriptionProps) => {
  const descriptionIllustration = './descriptionIllustration.svg'
  return (
    <Box display="flex" alignItems="center" height="100%" padding="30px">
      <Box flex="1" padding="10px">
        <Box display="flex" alignItems="center" mb="4">
          <Text fontSize="2xl" fontWeight="bold" mr="2">
            Lesson Description
          </Text>
          <Tooltip
            label="Tip: For each module, first watch the corresponding video, then complete all of the Instructional Materials in order."
            fontSize="md"
          >
            <Icon
              as={InfoOutlineIcon}
              w={6}
              h={6}
              color="gray.500"
              cursor="pointer"
            />
          </Tooltip>
        </Box>
        <Text mb="4">{lessonDescription}</Text>
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb="2">
            Resources:
          </Text>
          {resources.length > 0 &&
            resources.map((resource) => (
              <Box key={resource.id} mb="2">
                <Link href={resource.url} passHref>
                  <ChakraLink color="purple.500" textDecoration="underline">
                    {resource.name}
                  </ChakraLink>
                </Link>
              </Box>
            ))}
        </Box>
      </Box>
      <Box flex="1" display="flex" justifyContent="center" padding="10px">
        <Image
          src={descriptionIllustration}
          alt="Lesson Description Illustration"
        />
      </Box>
    </Box>
  )
}

export default LessonDescription
