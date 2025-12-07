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

          selectNextLesson(coursesData, progressData)
          setIsLoading(false)
        },
      )
      .catch((error) => {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      })
  }, [])

  const selectNextLesson = (
    courses: Course[],
    progress: { [key: number]: number },
  ) => {
    let lessonToSelect: Lesson | null = null

    // Get all lessons across all courses and sort them by displayOrder
    const allLessons = courses
      .flatMap((course) =>
        course.lessons.map((lesson) => ({
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
            lessonProgress={lessonProgress} // Pass lesson progress down as a prop
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
