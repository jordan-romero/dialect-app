import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  currentLessonId: number | null
  lessonProgress: { [key: number]: number } // Receive lesson progress as a prop
}

const CourseSideBar = ({
  courses,
  onSelectLesson,
  hasAccessToPaidCourses,
  currentLessonId,
  lessonProgress,
}: CourseSideBarProps) => {
  const [expandedCourses, setExpandedCourses] = useState<{
    [key: number]: boolean
  }>({})

  const courseList = useMemo(
    (): Course[] => (Array.isArray(courses) ? courses : []),
    [courses],
  )

  // Primitives only — avoids re-running the effect when the `courses` array is a new
  // reference each render with the same contents (would loop with setExpandedCourses).
  const coursesStableKey = useMemo(() => {
    if (!Array.isArray(courses) || courses.length === 0) return ''
    return courses.map((c) => c.id).join(',')
  }, [courses])

  const coursesRef = useRef(courses)
  coursesRef.current = courses

  useEffect(() => {
    if (!currentLessonId) return

    const list = Array.isArray(coursesRef.current) ? coursesRef.current : []
    if (list.length === 0) return

    const currentCourse = list.find((course) =>
      course.lessons?.some((lesson) => lesson.id === currentLessonId),
    )
    if (!currentCourse) return

    setExpandedCourses((prev) => {
      if (prev[currentCourse.id]) return prev
      return { ...prev, [currentCourse.id]: true }
    })
  }, [currentLessonId, coursesStableKey])

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
        {courseList.map((course) => (
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
                {(course.lessons ?? []).map((lesson, index) => {
                  const courseLessons = course.lessons ?? []
                  const isLocked = isLessonLocked(lesson, index, courseLessons)
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
                        as={getLessonIcon(lesson, index, courseLessons)}
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
                      <Text>
                        {lesson.displayOrder
                          ? `${lesson.displayOrder}. ${lesson.title}`
                          : lesson.title}
                      </Text>
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
