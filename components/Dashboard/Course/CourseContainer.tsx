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

  // All lessons across courses in true course order: by course, then by
  // displayOrder. Checkpoints have a null displayOrder, so place them last
  // within their course (not first, which `?? 0` used to do).
  const orderedLessons = (coursesArg: Course[]) =>
    (Array.isArray(coursesArg) ? coursesArg : [])
      .flatMap((course) =>
        (course.lessons ?? []).map((lesson) => ({
          ...lesson,
          courseId: course.id,
        })),
      )
      .sort((a, b) =>
        a.courseId !== b.courseId
          ? a.courseId - b.courseId
          : (a.displayOrder ?? Number.POSITIVE_INFINITY) -
            (b.displayOrder ?? Number.POSITIVE_INFINITY),
      )

  // On initial load: resume at the first incomplete lesson (fall back to the
  // first lesson if everything is already complete).
  const selectNextLesson = (
    coursesArg: Course[],
    progress: { [key: number]: number },
  ) => {
    const all = orderedLessons(coursesArg)
    const lessonToSelect =
      all.find((lesson) => progress[lesson.id] !== 100) ?? all[0]
    if (lessonToSelect) setSelectedLesson(lessonToSelect)
  }

  // After finishing a lesson: advance to the very next lesson in order.
  const goToNextLesson = (currentLessonId: number) => {
    const all = orderedLessons(courses ?? [])
    const idx = all.findIndex((lesson) => lesson.id === currentLessonId)
    const next = idx >= 0 && idx + 1 < all.length ? all[idx + 1] : null
    if (next) setSelectedLesson(next)
  }

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    // Set the lesson as in progress when selected, if not already completed
    setLessonProgress((prev) => ({
      ...prev,
      [lesson.id]: prev[lesson.id] === 100 ? 100 : 50,
    }))
  }

  const handleLessonComplete = async () => {
    if (!selectedLesson) return
    const completedId = selectedLesson.id
    setLessonProgress((prev) => ({ ...prev, [completedId]: 100 }))

    // Re-fetch courses so a phase that just got fully completed unlocks the next
    // phase immediately, then advance to the next lesson using the fresh data.
    try {
      const res = await fetch('/api/courses')
      if (res.ok) {
        const fresh = await res.json()
        if (Array.isArray(fresh)) {
          setCourses(fresh)
          const all = orderedLessons(fresh)
          const idx = all.findIndex((l) => l.id === completedId)
          const next = idx >= 0 && idx + 1 < all.length ? all[idx + 1] : null
          if (next) setSelectedLesson(next)
          return
        }
      }
    } catch {
      /* fall through to local advance */
    }
    goToNextLesson(completedId)
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
