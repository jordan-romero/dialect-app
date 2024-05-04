import React, { useEffect, useState } from 'react'
import { Box, Flex, Text, Icon, VStack, HStack } from '@chakra-ui/react'
import {
  MdCheck,
  MdLockOpen,
  MdLock,
  MdRadioButtonUnchecked,
} from 'react-icons/md'
import { Lesson } from './courseTypes'

type CourseSideBarProps = {
  lessons: Lesson[] | null
  onSelectLesson: (lesson: Lesson) => void
  hasAccessToPaidCourses: boolean
}

const CourseSideBar = ({
  lessons,
  onSelectLesson,
  hasAccessToPaidCourses,
}: CourseSideBarProps) => {
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})

  useEffect(() => {
    const fetchLessonProgress = async () => {
      try {
        const response = await fetch('/api/lessonProgress')
        if (response.ok) {
          const data = await response.json()
          setLessonProgress(data)
        } else {
          console.error(
            'Error retrieving lesson progress:',
            response.statusText,
          )
        }
      } catch (error) {
        console.error('Error retrieving lesson progress:', error)
      }
    }

    fetchLessonProgress()
  }, [])

  const isLessonLocked = (lesson: Lesson, index: number) => {
    if (index === 0) return false

    // Check if the previous lesson is completed
    if (lessons && lessonProgress[lessons[index - 1].id] === 100) {
      return false // Unlock this lesson if the previous one is completed
    }

    return true // Lock the lesson if none of the above conditions are met
  }

  const getLessonIcon = (lesson: Lesson, index: number) => {
    const progress = lessonProgress[lesson.id] || 0

    if (isLessonLocked(lesson, index)) {
      return MdLock // Show a locked icon if the lesson is locked
    } else if (progress === 100) {
      return MdCheck // Show a check mark if the lesson is completed
    } else if (progress === 50) {
      return MdRadioButtonUnchecked // Show an in-progress icon if the lesson is half completed
    } else {
      return MdLockOpen // Show an unlocked icon for lessons that are unlocked but not started
    }
  }

  return (
    <Box
      p={4}
      width={300}
      height="100vh"
      bg="gray.100"
      color="black"
      borderTopLeftRadius="xl"
      borderBottomLeftRadius="xl"
    >
      <Flex direction="column" overflowY="auto">
        <VStack spacing={2} align="stretch">
          {lessons &&
            lessons.map((lesson, index) => (
              <HStack
                key={lesson.id}
                onClick={() =>
                  !isLessonLocked(lesson, index) && onSelectLesson(lesson)
                }
                cursor={
                  !isLessonLocked(lesson, index) ? 'pointer' : 'not-allowed'
                }
                opacity={!isLessonLocked(lesson, index) ? 1 : 0.5}
              >
                <Icon
                  as={getLessonIcon(lesson, index)}
                  boxSize={6}
                  mr={4}
                  color={
                    lessonProgress[lesson.id] === 100
                      ? 'green.500'
                      : lessonProgress[lesson.id] === 50
                      ? 'purple.500'
                      : 'gray.500'
                  }
                />
                <Text>{lesson.title}</Text>
              </HStack>
            ))}
        </VStack>
      </Flex>
    </Box>
  )
}

export default CourseSideBar
