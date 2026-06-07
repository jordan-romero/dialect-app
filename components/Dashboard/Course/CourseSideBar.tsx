import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Flex, Text, Icon, VStack, HStack } from '@chakra-ui/react'
import {
  MdCheck,
  MdLockOpen,
  MdLock,
  MdRadioButtonUnchecked,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md'
import { Course, Lesson } from './courseTypes'

const isCheckpoint = (lesson: { title?: string }) =>
  /checkpoint/i.test(lesson.title || '')

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

  // A whole phase (course) is locked until the previous phase is complete.
  // The courses API sets `unlocked` per course.
  const isCourseLocked = (course: Course) => (course as any).unlocked === false

  const getLessonIcon = (
    lesson: Lesson,
    index: number,
    courseLessons: Lesson[],
    courseLocked = false,
  ) => {
    const progress = lessonProgress[lesson.id] || 0

    if (courseLocked || isLessonLocked(lesson, index, courseLessons)) {
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

  const iconColor = (
    lesson: Lesson,
    index: number,
    courseLessons: Lesson[],
    courseLocked: boolean,
    isCurrent: boolean,
  ) => {
    if (courseLocked || isLessonLocked(lesson, index, courseLessons))
      return 'gray.400'
    const progress = lessonProgress[lesson.id] || 0
    if (progress === 100) return 'green.500'
    if (isCurrent || progress > 0) return 'brand.iris'
    return 'gray.400'
  }

  // A checkpoint sits right after its own phase (as a distinct entry, not a
  // phase lesson). It unlocks once every non-checkpoint lesson in that phase
  // is done.
  const checkpointLocked = (course: Course) =>
    isCourseLocked(course) ||
    (course.lessons ?? []).some(
      (l) => !isCheckpoint(l) && (lessonProgress[l.id] || 0) < 100,
    )

  return (
    <Box
      p={3}
      width={300}
      height="100%"
      bg="white"
      color="gray.800"
      borderRight="1px solid"
      borderColor="gray.100"
      overflowY="auto"
    >
      <VStack spacing={5} align="stretch">
        {courseList.map((course) => {
          const courseLocked = isCourseLocked(course)
          const expanded = expandedCourses[course.id]
          const courseCheckpoints = (course.lessons ?? []).filter(isCheckpoint)
          return (
            <React.Fragment key={course.id}>
              <Box>
                <Flex
                  as="button"
                  w="100%"
                  align="center"
                  justify="space-between"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  opacity={courseLocked ? 0.55 : 1}
                  _hover={{ bg: 'gray.50' }}
                  transition="background 0.15s ease"
                  onClick={() => toggleCourseExpansion(course.id)}
                >
                  <HStack spacing={2}>
                    {courseLocked && (
                      <Icon as={MdLock} boxSize={4} color="gray.400" />
                    )}
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      letterSpacing="-0.01em"
                    >
                      {course.title}
                    </Text>
                  </HStack>
                  <Icon
                    as={expanded ? MdExpandLess : MdExpandMore}
                    boxSize={5}
                    color="gray.400"
                  />
                </Flex>

                {expanded && (
                  <VStack spacing={1} align="stretch" mt={1}>
                    {(course.lessons ?? []).map((lesson, index) => {
                      const courseLessons = course.lessons ?? []
                      // Checkpoints render as a distinct entry after the phase.
                      if (isCheckpoint(lesson)) return null
                      const isLocked =
                        courseLocked ||
                        isLessonLocked(lesson, index, courseLessons)
                      const isCurrent = lesson.id === currentLessonId
                      return (
                        <Flex
                          key={lesson.id}
                          align="center"
                          gap={3}
                          px={3}
                          py={2.5}
                          borderRadius="lg"
                          borderLeft="3px solid"
                          borderLeftColor={
                            isCurrent ? 'brand.iris' : 'transparent'
                          }
                          bg={isCurrent ? 'purple.50' : 'transparent'}
                          color={isCurrent ? 'brand.iris' : 'gray.700'}
                          fontWeight={isCurrent ? 'semibold' : 'normal'}
                          opacity={isLocked ? 0.5 : 1}
                          cursor={isLocked ? 'not-allowed' : 'pointer'}
                          transition="background 0.15s ease"
                          _hover={{ bg: isLocked ? 'transparent' : 'gray.50' }}
                          onClick={() => !isLocked && onSelectLesson(lesson)}
                        >
                          <Icon
                            as={getLessonIcon(
                              lesson,
                              index,
                              courseLessons,
                              courseLocked,
                            )}
                            boxSize={5}
                            flexShrink={0}
                            color={iconColor(
                              lesson,
                              index,
                              courseLessons,
                              courseLocked,
                              isCurrent,
                            )}
                          />
                          <Text fontSize="sm" noOfLines={2}>
                            {lesson.displayOrder
                              ? `${lesson.displayOrder}. ${lesson.title}`
                              : lesson.title}
                          </Text>
                        </Flex>
                      )
                    })}
                  </VStack>
                )}
              </Box>

              {courseCheckpoints.map((cp) => {
                const locked = checkpointLocked(course)
                const isCurrent = cp.id === currentLessonId
                const done = (lessonProgress[cp.id] || 0) === 100
                return (
                  <Flex
                    key={cp.id}
                    as="button"
                    w="100%"
                    align="center"
                    justify="space-between"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    opacity={locked ? 0.55 : 1}
                    bg={isCurrent ? 'purple.50' : 'transparent'}
                    cursor={locked ? 'not-allowed' : 'pointer'}
                    transition="background 0.15s ease"
                    _hover={{ bg: locked ? 'transparent' : 'gray.50' }}
                    onClick={() => !locked && onSelectLesson(cp)}
                  >
                    <HStack spacing={2}>
                      {locked && (
                        <Icon as={MdLock} boxSize={4} color="gray.400" />
                      )}
                      <Text
                        fontWeight="bold"
                        fontSize="md"
                        letterSpacing="-0.01em"
                        color={isCurrent ? 'brand.iris' : 'gray.800'}
                      >
                        {cp.title}
                      </Text>
                    </HStack>
                    {done && !locked && (
                      <Icon as={MdCheck} boxSize={5} color="green.500" />
                    )}
                  </Flex>
                )
              })}
            </React.Fragment>
          )
        })}
      </VStack>
    </Box>
  )
}

export default CourseSideBar
