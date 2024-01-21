import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainer from '../Lesson/LessonContainer'
import { Course, Lesson } from './courseTypes'
import { Flex, Box } from '@chakra-ui/react'

const CourseContainer = () => {
  const [freeCourses, setFreeCourses] = useState<Course[] | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    // Fetch a list of free courses from the API route
    fetch('/api/freeCourses')
      .then((response) => response.json())
      .then((data: Course[]) => {
        setFreeCourses(data)
        console.log(data)
      })
      .catch((error) => {
        console.error('Error fetching free courses:', error)
      })
  }, [])

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  return (
    <Flex w="100%">
      <Box>
        <CourseSideBar
          freeCourses={freeCourses}
          onSelectLesson={handleSelectLesson}
        />
      </Box>
      <Box flex="2">
        {selectedLesson && (
          <Flex justifyContent="center" alignItems="center" height="100vh">
            <LessonContainer lesson={selectedLesson} />
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export default CourseContainer
