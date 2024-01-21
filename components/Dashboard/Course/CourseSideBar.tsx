import React, { useState } from 'react'
import { Box, Flex, Text, Icon, VStack, HStack } from '@chakra-ui/react'
import {
  MdLockOpen,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from 'react-icons/md'
import LessonTracker from '../Lesson/LessonTracker'
import { Course, CourseSideBarProps } from './courseTypes'

const CourseSideBar = ({ freeCourses, onSelectLesson }: CourseSideBarProps) => {
  const [currentLesson, setCurrentLesson] = useState<number>(0)
  const [expandedCourses, setExpandedCourses] = useState<number[]>([])

  const toggleCourse = (courseIndex: number) => {
    // Toggle the course's expanded/collapsed status
    if (expandedCourses.includes(courseIndex)) {
      setExpandedCourses(
        expandedCourses.filter((index) => index !== courseIndex),
      )
    } else {
      setExpandedCourses([...expandedCourses, courseIndex])
    }
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
        {freeCourses &&
          freeCourses.map((course: Course, index: number) => (
            <Box key={index} mb={index === 0 ? 2 : 4} cursor="pointer">
              <Flex alignItems="center" onClick={() => toggleCourse(index)}>
                <Icon
                  as={MdLockOpen}
                  boxSize={6}
                  mr={4}
                  color="brand.purpleLight"
                />
                <Text fontSize="xl">{course.title}</Text>
                <Icon
                  as={
                    expandedCourses.includes(index)
                      ? MdKeyboardArrowUp
                      : MdKeyboardArrowDown
                  }
                  boxSize={6}
                  ml={4}
                  color="brand.purpleLight"
                />
              </Flex>
              {expandedCourses.includes(index) && (
                <Box mb={6} width="100%">
                  <LessonTracker
                    totalLessons={course.lessons.length}
                    currentLesson={currentLesson}
                    lessons={course.lessons}
                    onSelectLesson={onSelectLesson}
                  />
                </Box>
              )}
            </Box>
          ))}
      </Flex>
    </Box>
  )
}

export default CourseSideBar
