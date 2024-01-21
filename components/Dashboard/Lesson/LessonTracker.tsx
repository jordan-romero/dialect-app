import React, { useState } from 'react'
import { Text, Icon, VStack, HStack, Box } from '@chakra-ui/react'
import { MdCheck, MdFiberManualRecord, MdLock } from 'react-icons/md' // Import the checkmark and lock icons
import { Lesson } from '../Course/courseTypes'

const LessonTracker = ({
  totalLessons,
  currentLesson,
  lessons,
  onSelectLesson,
}: {
  totalLessons: number
  currentLesson: number
  lessons: Lesson[]
  onSelectLesson: (lesson: Lesson) => void
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const lessonIcon = (index: number) => {
    if (index < currentLesson) {
      return <Icon as={MdCheck} color="green.500" boxSize={2} /> // Checkmark for completed lesson
    } else if (index === currentLesson) {
      return <Icon as={MdFiberManualRecord} color="green.500" boxSize={2} /> // Current lesson
    } else {
      return <Icon as={MdLock} color="gray.500" boxSize={2} /> // Locked lesson
    }
  }

  const lessonStyle = (index: number) => {
    return {
      borderBottom:
        selectedLesson === lessons[index] ? '2px solid blue' : 'none',
      cursor: 'pointer',
      padding: '8px',
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    onSelectLesson(lesson)
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
          {lessonIcon(index)}
          <Text fontSize="md">{lesson.title}</Text>
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
