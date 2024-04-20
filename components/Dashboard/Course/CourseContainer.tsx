import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainer from '../Lesson/LessonContainer'
import { Lesson } from './courseTypes'
import { Flex, Box } from '@chakra-ui/react'
import { useUser } from '@auth0/nextjs-auth0/client'

const CourseContainer = () => {
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})

  console.log(lessonProgress, 'lessonProgress')

  useEffect(() => {
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
      })
      .catch((error) => {
        console.error('Error fetching lessons:', error)
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

  const handleLessonComplete = async (lessonId: number) => {
    try {
      const response = await fetch('/api/updateProgress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      })
      if (!response.ok) {
        throw new Error(`Failed to update progress. Status: ${response.status}`)
      }

      // Update lesson progress locally if the API call succeeds
      setLessonProgress((prevProgress) => ({
        ...prevProgress,
        [lessonId]: 100,
      }))
    } catch (error) {
      console.error('Error updating lesson progress:', error)
    }
  }

  console.log(lessons, 'test lessons')

  return (
    <Flex w="100%">
      <Box w="300px">
        <CourseSideBar
          lessons={lessons}
          onSelectLesson={handleSelectLesson}
          hasAccessToPaidCourses={false}
        />
      </Box>
      <Box flex="2">
        {selectedLesson && (
          <Flex justifyContent="center" alignItems="center" height="100vh">
            <LessonContainer
              lesson={selectedLesson}
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
