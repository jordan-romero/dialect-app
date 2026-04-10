import React from 'react'
import { Box, Text, Image, Tooltip, Icon } from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { buildLessonOutlineLabels } from './lessonOutline'

type LessonDescriptionProps = {
  lesson: Lesson
}

const LessonDescription = ({ lesson }: LessonDescriptionProps) => {
  const descriptionIllustration = './descriptionIllustration.svg'
  const outlineLabels = buildLessonOutlineLabels(lesson)
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
        <Text mb="4">{lesson.description}</Text>
        {outlineLabels.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb="2">
              Outline:
            </Text>
            {outlineLabels.map((label, index) => (
              <Box key={`${index}-${label}`} mb="2">
                <Text color="gray.700" fontWeight="medium">
                  {label}
                </Text>
              </Box>
            ))}
          </Box>
        )}
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
