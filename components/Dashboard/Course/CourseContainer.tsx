import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import CourseSideBar from './CourseSideBar'
import { Course, Lesson } from './courseTypes'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Box,
  Button,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { FiList } from 'react-icons/fi'
import LessonContainerV3 from '../Lesson/LessonContainerV3'
import { SidebarSkeleton, LessonSkeleton } from './CourseSkeleton'

const CourseContainer = () => {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{
    [key: number]: number
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Mobile/tablet: the lesson list opens as a drawer instead of a fixed sidebar.
  const lessons = useDisclosure()

  useEffect(() => {
    if (!router.isReady) return

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
    // Fetch once the router is ready and pick the resume lesson; the helpers
    // it calls are stable for this run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

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
    const requestedLessonId = Number(router.query.lesson)
    const requestedLesson = Number.isInteger(requestedLessonId)
      ? all.find((lesson) => lesson.id === requestedLessonId)
      : undefined

    if (requestedLesson) {
      setSelectedLesson(requestedLesson)
      return
    }

    const lessonToSelect =
      all.find((lesson) => progress[lesson.id] !== 100) ?? all[0]
    if (lessonToSelect) {
      setSelectedLesson(lessonToSelect)
    }
  }

  // Keep the current lesson in the history entry. Going to Library pushes a new
  // route, so Back returns here with this lesson instead of falling back to the
  // next incomplete lesson. The step within a lesson is owned entirely by
  // LessonContainerV3 (persisted to localStorage), so it isn't mirrored here —
  // one source of truth avoids the URL and the displayed step drifting apart.
  useEffect(() => {
    if (!router.isReady || !selectedLesson) return

    const lesson = String(selectedLesson.id)
    if (router.query.lesson === lesson) return

    void router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, lesson },
      },
      undefined,
      { shallow: true },
    )
  }, [router, selectedLesson])

  // After finishing a lesson: advance to the very next lesson in order.
  const goToNextLesson = (currentLessonId: number) => {
    const all = orderedLessons(courses ?? [])
    const idx = all.findIndex((lesson) => lesson.id === currentLessonId)
    const next = idx >= 0 && idx + 1 < all.length ? all[idx + 1] : null
    if (next) {
      setSelectedLesson(next)
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

  const handleLessonComplete = async () => {
    if (!selectedLesson) return
    const completedId = selectedLesson.id
    setLessonProgress((prev) => ({ ...prev, [completedId]: 100 }))

    // A finished lesson/phase may have earned a badge.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('badges:check'))
    }

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
          if (next) {
            setSelectedLesson(next)
          }
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
      <Flex justifyContent="center" alignItems="center" height="100%" p={8}>
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

  // The lesson list — selecting a lesson also closes the mobile drawer (a no-op
  // on desktop, where the drawer is never open).
  const sidebar = isLoading ? (
    <SidebarSkeleton />
  ) : (
    <CourseSideBar
      courses={Array.isArray(courses) ? courses : null}
      onSelectLesson={(lesson) => {
        handleSelectLesson(lesson)
        lessons.onClose()
      }}
      hasAccessToPaidCourses={false}
      currentLessonId={selectedLesson?.id || null}
      lessonProgress={lessonProgress}
    />
  )

  return (
    <>
      <Flex w="100%" h="100%">
        {/* Desktop: fixed lesson sidebar. Hidden on mobile/tablet. */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          w="300px"
          h="100%"
          flexShrink={0}
        >
          {sidebar}
        </Box>

        <Flex direction="column" flex="1" minW={0} h="100%">
          {/* Mobile/tablet: a "Lessons" button (padded past the floating menu
              button) opens the lesson list as a drawer. */}
          <Flex
            display={{ base: 'flex', lg: 'none' }}
            align="center"
            pl="60px"
            pr={3}
            py={2}
            flexShrink={0}
            borderBottom="1px solid"
            borderColor="border.subtle"
          >
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={FiList} />}
              onClick={lessons.onOpen}
            >
              Lessons
            </Button>
          </Flex>

          <Box flex="1" minH={0}>
            {isLoading ? (
              <LessonSkeleton />
            ) : selectedLesson ? (
              <Box height="100%">
                <LessonContainerV3
                  key={selectedLesson.id}
                  lesson={selectedLesson}
                  onLessonComplete={handleLessonComplete}
                />
              </Box>
            ) : (
              <Flex justifyContent="center" alignItems="center" height="100%">
                <Box>No lesson selected</Box>
              </Flex>
            )}
          </Box>
        </Flex>
      </Flex>

      <Drawer
        isOpen={lessons.isOpen}
        placement="left"
        onClose={lessons.onClose}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton zIndex={1} />
          <DrawerBody p={0}>{sidebar}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default CourseContainer
