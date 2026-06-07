import React, { useEffect, useState } from 'react'
import CourseSideBar from './CourseSideBar'
import LessonContainerV2 from '../Lesson/LessonContainerV2'
import { Course, Lesson } from './courseTypes'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Box,
  Spinner,
} from '@chakra-ui/react'
import LessonContainerV3 from '../Lesson/LessonContainerV3'

const CourseContainer = () => {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)

    const fetchCourses = fetch('/api/courses').then(async (response) => {
      const data: unknown = await response.json()
      if (!response.ok || !Array.isArray(data)) {
        const msg =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message: unknown }).message)
            : `HTTP ${response.status}`
        throw new Error(`Courses API: ${msg}`)
      }
      return data as Course[]
    })

    const fetchProgress = fetch('/api/lessonProgress')
      .then(async (response) => {
        const data: unknown = await response.json()
        if (!response.ok) return {}
        return typeof data === 'object' && data !== null && !Array.isArray(data)
          ? (data as { [key: number]: number })
          : {}
      })
      .catch(() => ({} as { [key: number]: number }))

    Promise.all([fetchCourses, fetchProgress])
      .then(([coursesData, progress]) => {
        setCourses(coursesData)
        setLessonProgress(progress)
        selectNextLesson(coursesData, progress)
        setIsLoading(false)
      })
      .catch((error: Error) => {
        console.error('Error fetching course data:', error)
        setLoadError(error.message)
        setIsLoading(false)
      })
  }, [])

  const selectNextLesson = (
    coursesArg: Course[],
    progress: { [key: number]: number },
  ) => {
    let lessonToSelect: Lesson | null = null

    const coursesList = Array.isArray(coursesArg) ? coursesArg : []

    // Get all lessons across all courses and sort them by displayOrder
    const allLessons = coursesList
      .flatMap((course) =>
        (course.lessons ?? []).map((lesson) => ({
          ...lesson,
          courseId: course.id, // Keep track of which course the lesson belongs to
        })),
      )
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

    // Find the first incomplete lesson
    lessonToSelect =
      allLessons.find((lesson) => progress[lesson.id] !== 100) ??
      allLessons[allLessons.length - 1] // Fallback to last lesson if all complete

    if (lessonToSelect) {
      setSelectedLesson(lessonToSelect)
    }
  }

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    // Set the lesson as in progress when selected, if not already completed
    setLessonProgress((prev) => ({
      ...prev,
      [lesson.id]: prev[lesson.id] === 100 ? 100 : 50,
    }))
  }

  const handleLessonComplete = () => {
    if (selectedLesson) {
      setLessonProgress((prev) => {
        const updatedProgress = {
          ...prev,
          [selectedLesson.id]: 100,
        }
        return updatedProgress
      })

      // Select the next lesson after marking the current one as complete
      if (courses) {
        selectNextLesson(courses, {
          ...lessonProgress,
          [selectedLesson.id]: 100,
        })
      }
    }
  }

  if (loadError) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh" p={8}>
        <Alert status="error" borderRadius="md" maxW="600px">
          <AlertIcon />
          <Box>
            <AlertTitle>Failed to load courses</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Box>
        </Alert>
      </Flex>
    )
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
            courses={Array.isArray(courses) ? courses : null}
            onSelectLesson={handleSelectLesson}
            hasAccessToPaidCourses={false}
            currentLessonId={selectedLesson?.id || null}
            lessonProgress={lessonProgress}
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
            {selectedLesson.steps && selectedLesson.steps.length > 0 ? (
              <LessonContainerV3
                key={selectedLesson.id}
                lesson={selectedLesson}
                onLessonComplete={handleLessonComplete}
              />
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
