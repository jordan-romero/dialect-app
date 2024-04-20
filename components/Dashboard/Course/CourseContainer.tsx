// CourseContainer.tsx
import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainer from '../Lesson/LessonContainer'
import { Course, Lesson } from './courseTypes'
import { Flex, Box } from '@chakra-ui/react'

const CourseContainer = () => {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [totalLessons, setTotalLessons] = useState<number>(0)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})

  useEffect(() => {
    // Fetch a list of courses from the API route
    fetch('/api/courses')
      .then((response) => response.json())
      .then((data: Course[]) => {
        setCourses(data)
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
        console.error('Error fetching courses:', error)
      })
  }, [selectedLesson])

  useEffect(() => {
    // Fetch lesson progress data from the API route
    fetch('/api/lessonProgress')
      .then((response) => response.json())
      .then((data: { [key: number]: number }) => {
        setLessonProgress(data)
      })
      .catch((error) => {
        console.error('Error fetching lesson progress:', error)
      })
  }, [])

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  const handleLessonComplete = async (lessonId: number) => {
    try {
      // Update the progress in the database
      await fetch('/api/updateProgress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      })

      // Update the lesson progress state
      setLessonProgress((prevProgress) => ({
        ...prevProgress,
        [lessonId]: 100,
      }))
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  return (
    <Flex w="100%">
      <Box>
        <CourseSideBar
          courses={courses}
          onSelectLesson={handleSelectLesson}
          lessonProgress={lessonProgress}
        />
      </Box>
      <Box flex="2">
        {selectedLesson && (
          <Flex justifyContent="center" alignItems="center" height="100vh">
            <LessonContainer
              lesson={selectedLesson}
              totalLessons={totalLessons}
              onLessonComplete={handleLessonComplete}
              isCompleted={lessonProgress[selectedLesson.id] === 100}
            />
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export default CourseContainer
