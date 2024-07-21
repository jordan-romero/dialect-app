// CourseContainer.tsx
import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainerV2 from '../Lesson/LessonContainerV2'
import { Course, Lesson } from './courseTypes'
import { Flex, Box, Spinner } from '@chakra-ui/react'
import LessonContainerV3 from '../Lesson/LessonContainerV3'

const CourseContainer = () => {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch('/api/courses').then((response) => response.json()),
      fetch('/api/lessonProgress').then((response) => response.json()),
    ])
      .then(
        ([coursesData, progressData]: [
          Course[],
          { [key: number]: number },
        ]) => {
          setCourses(coursesData)
          setLessonProgress(progressData)

          // Find the first incomplete lesson or the last lesson if all are complete
          let lessonToSelect: Lesson | null = null
          for (const course of coursesData) {
            for (const lesson of course.lessons) {
              if (progressData[lesson.id] !== 100) {
                lessonToSelect = lesson
                break
              }
              lessonToSelect = lesson // This will be the last lesson if all are complete
            }
            if (lessonToSelect && progressData[lessonToSelect.id] !== 100) break
          }

          if (lessonToSelect) {
            setSelectedLesson(lessonToSelect)
          }

          setIsLoading(false)
        },
      )
      .catch((error) => {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      })
  }, [])

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    // Set the lesson as in progress when selected, if not already completed
    setLessonProgress((prev) => ({
      ...prev,
      [lesson.id]: prev[lesson.id] === 100 ? 100 : 50,
    }))
  }

  return (
    <Flex w="100%">
      <Box w="300px">
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" height="400px">
            <Spinner
              color="brand.purple"
              size="xl"
              thickness="4px"
              speed="0.65s"
            />
          </Flex>
        ) : (
          <CourseSideBar
            courses={courses}
            onSelectLesson={handleSelectLesson}
            hasAccessToPaidCourses={false}
            currentLessonId={selectedLesson?.id || null}
          />
        )}
      </Box>
      <Box flex="2">
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" height="100vh">
            <Spinner
              color="brand.purple"
              size="xl"
              thickness="4px"
              speed="0.65s"
            />
          </Flex>
        ) : selectedLesson ? (
          <Flex justifyContent="center" alignItems="center" height="100vh">
            {selectedLesson.steps ? (
              <LessonContainerV3 lesson={selectedLesson} />
            ) : (
              <LessonContainerV2 lesson={selectedLesson} />
            )}
          </Flex>
        ) : (
          <Flex justifyContent="center" alignItems="center" height="100vh">
            <Box>No lesson selected</Box>
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export default CourseContainer
