import React, { useState } from 'react'
import { Text, Icon, VStack, HStack, Box } from '@chakra-ui/react'
import { MdFiberManualRecord } from 'react-icons/md'
import { Lesson } from '../Course/courseTypes'
import LessonContainer from './LessonContainer' // Import the LessonContainer component

function LessonTracker({
  totalLessons,
  currentLesson,
  lessons,
  onSelectLesson,
}: {
  totalLessons: number
  currentLesson: number
  lessons: Lesson[]
  onSelectLesson: (lesson: Lesson) => void
}) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const circleColor = (index: number) => {
    if (index < currentLesson) {
      return 'green.500' // Completed lesson
    } else if (index === currentLesson) {
      return 'green.500' // Current lesson
    } else {
      return 'gray.200' // Future lesson (locked)
    }
  }

  const lessonStyle = (index: number) => {
    return {
      background:
        selectedLesson === lessons[index] ? 'lightgray' : 'transparent',
      borderBottom:
        selectedLesson === lessons[index] ? '2px solid blue' : 'none',
      cursor: 'pointer',
      padding: '8px',
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    onSelectLesson(lesson) // Call onSelectLesson prop with the selected lesson
  }

  return (
    <VStack spacing={0} alignItems="start">
      {lessons.map((lesson, index) => (
        <HStack
          key={index}
          alignItems="center"
          position="relative"
          onClick={() => handleLessonClick(lesson)}
          style={lessonStyle(index)}
        >
          <Icon as={MdFiberManualRecord} color="white" boxSize={2} />
          <Text fontSize="sm">{lesson.title}</Text>
          {index < totalLessons - 1 && (
            <Box
              position="absolute"
              top="12px"
              left="-5px"
              width="1px"
              height="100%"
              bg="white"
              zIndex={-1}
            ></Box>
          )}
        </HStack>
      ))}
    </VStack>
  )
}

export default LessonTracker
