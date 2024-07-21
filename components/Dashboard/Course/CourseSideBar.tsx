import React, { useEffect, useState } from 'react'
import { Box, Flex, Text, Icon, VStack, HStack, Button } from '@chakra-ui/react'
import {
  MdCheck,
  MdLockOpen,
  MdLock,
  MdRadioButtonUnchecked,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md'
import { Course, Lesson } from './courseTypes'

type CourseSideBarProps = {
  courses: Course[] | null
  onSelectLesson: (lesson: Lesson) => void
  hasAccessToPaidCourses: boolean
  currentLessonId: number | null // Add this prop to know the current lesson
}

const CourseSideBar = ({
  courses,
  onSelectLesson,
  hasAccessToPaidCourses,
  currentLessonId,
}: CourseSideBarProps) => {
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})
  const [expandedCourses, setExpandedCourses] = useState<{
    [key: number]: boolean
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

  useEffect(() => {
    // Automatically expand the course containing the current lesson
    if (currentLessonId && courses) {
      const currentCourse = courses.find((course) =>
        course.lessons.some((lesson) => lesson.id === currentLessonId),
      )
      if (currentCourse) {
        setExpandedCourses((prev) => ({ ...prev, [currentCourse.id]: true }))
      }
    }
  }, [currentLessonId, courses])

  const isLessonLocked = (
    lesson: Lesson,
    index: number,
    courseLessons: Lesson[],
  ) => {
    if (index === 0) return false

    // Check if any previous lesson is not completed
    for (let i = 0; i < index; i++) {
      if (lessonProgress[courseLessons[i].id] !== 100) {
        return true
      }
    }

    return false
  }

  const getLessonIcon = (
    lesson: Lesson,
    index: number,
    courseLessons: Lesson[],
  ) => {
    const progress = lessonProgress[lesson.id] || 0

    if (isLessonLocked(lesson, index, courseLessons)) {
      return MdLock
    } else if (progress === 100) {
      return MdCheck
    } else if (progress > 0) {
      return MdRadioButtonUnchecked
    } else {
      return MdLockOpen
    }
  }

  const toggleCourseExpansion = (courseId: number) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }))
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
      overflowY="auto"
    >
      <VStack spacing={4} align="stretch">
        {courses &&
          courses.map((course) => (
            <Box key={course.id}>
              <Button
                variant="ghost"
                justifyContent="space-between"
                width="100%"
                onClick={() => toggleCourseExpansion(course.id)}
              >
                <Text fontWeight="bold" fontSize="lg">
                  {course.title}
                </Text>
                <Icon
                  as={expandedCourses[course.id] ? MdExpandLess : MdExpandMore}
                  boxSize={6}
                />
              </Button>
              {expandedCourses[course.id] && (
                <VStack spacing={2} align="stretch" pl={4} mt={2}>
                  {course.lessons.map((lesson, index) => {
                    const isLocked = isLessonLocked(
                      lesson,
                      index,
                      course.lessons,
                    )
                    const isCurrent = lesson.id === currentLessonId
                    return (
                      <HStack
                        key={lesson.id}
                        onClick={() => !isLocked && onSelectLesson(lesson)}
                        cursor={isLocked ? 'not-allowed' : 'pointer'}
                        opacity={isLocked ? 0.5 : 1}
                        bg={isCurrent ? 'blue.100' : 'transparent'}
                        p={2}
                        borderRadius="md"
                      >
                        <Icon
                          as={getLessonIcon(lesson, index, course.lessons)}
                          boxSize={6}
                          mr={4}
                          color={
                            lessonProgress[lesson.id] === 100
                              ? 'green.500'
                              : lessonProgress[lesson.id] > 0
                              ? 'purple.500'
                              : 'gray.500'
                          }
                        />
                        <Text>{`${index + 1}. ${lesson.title}`}</Text>
                      </HStack>
                    )
                  })}
                </VStack>
              )}
            </Box>
          ))}
      </VStack>
    </Box>
  )
}

export default CourseSideBar
