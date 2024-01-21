import React from 'react'
import { Box, Text, Button, Link } from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'

type LessonContainerProps = {
  lesson: Lesson
}

const LessonContainer: React.FC<LessonContainerProps> = ({ lesson }) => {
  return (
    <Box>
      {/* Lesson Title */}
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        {lesson.title}
      </Text>

      {/* Lesson Description */}
      <Text fontSize="md" mb={4}>
        {lesson.description}
      </Text>

      {/* Video */}
      <Box mb={4}>
        <iframe
          width="100%"
          height="400"
          src={lesson.videoUrl}
          title={lesson.title}
          allowFullScreen
        ></iframe>
      </Box>

      {lesson.resources && lesson.resources.length > 0 && (
        <Box mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Lesson Resources:
          </Text>
          <ul>
            {lesson.resources.map(
              (resource: {
                id: React.Key | null | undefined
                url: string | undefined
                name:
                  | string
                  | number
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | React.ReactFragment
                  | React.ReactPortal
                  | null
                  | undefined
              }) => (
                <li key={resource.id}>
                  <Link
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.name}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Box>
      )}

      {/* Start Quiz Button (if available) */}
      {lesson.quiz && (
        <Button
          colorScheme="blue"
          onClick={() => {
            /* Handle quiz start */
          }}
        >
          Start Quiz
        </Button>
      )}
    </Box>
  )
}

export default LessonContainer
