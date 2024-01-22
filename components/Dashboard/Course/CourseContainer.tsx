import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainer from '../Lesson/LessonContainer'
import { Course, Lesson } from './courseTypes'
import { Flex, Box } from '@chakra-ui/react'

const CourseContainer = () => {
  const [freeCourses, setFreeCourses] = useState<Course[] | null>(null)
  const [totalLessons, setTotalLessons] = useState<number>(0) // Total number of lessons for the selected course
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    // Fetch a list of free courses from the API route
    fetch('/api/freeCourses')
      .then((response) => response.json())
      .then((data: Course[]) => {
        setFreeCourses(data)

        // Calculate the total number of lessons for the selected course
        const selectedCourse = data.find(
          (course) => course.id === selectedLesson?.courseId,
        )
        const total = selectedCourse?.lessons
          ? selectedCourse.lessons.length
          : 0

        setTotalLessons(total)

        console.log(data)
      })
      .catch((error) => {
        console.error('Error fetching free courses:', error)
      })
  }, [selectedLesson])

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
            <LessonContainer
              lesson={selectedLesson}
              totalLessons={totalLessons}
            />
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export default CourseContainer
