// CourseSideBar.tsx
import React, { useState } from 'react'
import { Box, Flex, Text, Icon, VStack, HStack } from '@chakra-ui/react'
import {
  MdLockOpen,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdCheck,
  MdLock,
  MdRadioButtonUnchecked,
} from 'react-icons/md'
import { Course, Lesson } from './courseTypes'

type CourseSideBarProps = {
  courses: Course[] | null
  onSelectLesson: (lesson: Lesson) => void
  lessonProgress: { [key: number]: number }
}

const CourseSideBar = ({
  courses,
  onSelectLesson,
  lessonProgress,
}: CourseSideBarProps) => {
  const [expandedCourses, setExpandedCourses] = useState<number[]>([])

  const toggleCourse = (courseIndex: number) => {
    if (expandedCourses.includes(courseIndex)) {
      setExpandedCourses(
        expandedCourses.filter((index) => index !== courseIndex),
      )
    } else {
      setExpandedCourses([...expandedCourses, courseIndex])
    }
  }

  const getLessonIcon = (
    lesson: Lesson,
    courseIndex: number,
    lessonIndex: number,
  ) => {
    const progress = lessonProgress[lesson.id] || 0

    if (progress === 100) {
      return MdCheck
    } else if (progress === 50) {
      return MdRadioButtonUnchecked
    } else if (isLessonLocked(lesson, courseIndex, lessonIndex)) {
      return MdLock
    } else {
      return MdLockOpen
    }
  }

  const isLessonLocked = (
    lesson: Lesson,
    courseIndex: number,
    lessonIndex: number,
  ) => {
    if (lessonIndex === 0) return false

    if (courses) {
      let previousLesson: Lesson | undefined

      if (lessonIndex > 0) {
        const currentCourse = courses[courseIndex]
        if (currentCourse && currentCourse.lessons) {
          previousLesson = currentCourse.lessons[lessonIndex - 1]
        }
      }

      if (previousLesson && 'id' in previousLesson) {
        return lessonProgress[previousLesson.id] !== 100
      }
    }

    return true
  }

  return (
    <Box
      p={4}
      width={300}
      height="100vh"
      bg="util.gray"
      color="util.black"
      borderTopLeftRadius="xl"
      borderBottomLeftRadius="xl"
    >
      <Flex direction="column">
        {courses &&
          courses.map((course: Course, courseIndex: number) => (
            <Box
              key={courseIndex}
              mb={courseIndex === 0 ? 2 : 4}
              cursor="pointer"
            >
              <Flex
                alignItems="center"
                onClick={() => toggleCourse(courseIndex)}
              >
                <Icon
                  as={MdLockOpen}
                  boxSize={6}
                  mr={4}
                  color="brand.purpleLight"
                />
                <Text fontSize="xl">{course.title}</Text>
                <Icon
                  as={
                    expandedCourses.includes(courseIndex)
                      ? MdKeyboardArrowUp
                      : MdKeyboardArrowDown
                  }
                  boxSize={6}
                  ml={4}
                  color="brand.purpleLight"
                />
              </Flex>
              {expandedCourses.includes(courseIndex) && (
                <Box mb={6} width="100%">
                  <VStack spacing={2} align="stretch">
                    {course.lessons.map(
                      (lesson: Lesson, lessonIndex: number) => (
                        <HStack
                          key={lesson.id}
                          onClick={() =>
                            !isLessonLocked(lesson, courseIndex, lessonIndex) &&
                            onSelectLesson(lesson)
                          }
                          cursor={
                            isLessonLocked(lesson, courseIndex, lessonIndex)
                              ? 'not-allowed'
                              : 'pointer'
                          }
                          opacity={
                            course.isGatedCourse &&
                            isLessonLocked(lesson, courseIndex, lessonIndex)
                              ? 0.6
                              : 1
                          }
                        >
                          <Icon
                            as={getLessonIcon(lesson, courseIndex, lessonIndex)}
                            boxSize={6}
                            mr={4}
                            color={
                              lessonProgress[lesson.id] === 100
                                ? 'green.500'
                                : lessonProgress[lesson.id] === 50
                                ? 'brand.purpleLight'
                                : 'gray.500'
                            }
                          />
                          <Text>{lesson.title}</Text>
                        </HStack>
                      ),
                    )}
                  </VStack>
                </Box>
              )}
            </Box>
          ))}
      </Flex>
    </Box>
  )
}

export default CourseSideBar
