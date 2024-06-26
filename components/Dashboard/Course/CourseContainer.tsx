// CourseContainer.tsx
import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainerV2 from '../Lesson/LessonContainerV2'
import { Lesson } from './courseTypes'
import { Flex, Box, Spinner } from '@chakra-ui/react'

const CourseContainer = () => {
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/lessons')
      .then((response) => response.json())
      .then((data: Lesson[]) => {
        setLessons(data)
        if (data && data.length > 0) {
          const firstLesson = data[0]
          setSelectedLesson(firstLesson)
          // Set the first lesson as in progress if it's not completed
          setLessonProgress((prev) => ({
            ...prev,
            [firstLesson.id]: prev[firstLesson.id] === 100 ? 100 : 50,
          }))
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching lessons:', error)
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
            lessons={lessons}
            onSelectLesson={handleSelectLesson}
            hasAccessToPaidCourses={false}
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
            <LessonContainerV2 lesson={selectedLesson} />
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
