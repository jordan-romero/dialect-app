import React, { useState } from 'react'
import {
  Box,
  Text,
  Button,
  Link,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
} from '@chakra-ui/react'
import { Lesson, Resource } from '../Course/courseTypes'
import DragAndDropQuizModal from '../Quiz/DragAndDropQuizModal'
import ShortAnswerUI from '../Quiz/ShortAnswerUI'
import MultipleChoiceModal from '../Quiz/MultipleChoiceModal'
import SymbolQuiz from '../Quiz/SymbolQuiz'
import { lessonTypeComponentMap } from './utils'

type LessonContainerProps = {
  lesson: Lesson
  onLessonComplete: (lessonId: number) => void
  isCompleted: boolean
}

const LessonContainer: React.FC<LessonContainerProps> = ({
  lesson,
  onLessonComplete,
  isCompleted,
}) => {
  const handleLessonComplete = () => {
    onLessonComplete(lesson.id)
  }

  const getLessonType = (lesson: Lesson) => {
    if (lesson.videoUrl) {
      return 'video'
    } else if (lesson.resources && lesson.resources.length > 0) {
      return 'resource'
    } else if (lesson.title === 'Diphthongs & Triphtongs (3)') {
      return 'vowelQuad'
    } else {
      return 'symbolQuiz'
    }
  }

  const lessonType = getLessonType(lesson)

  const [isOpen, setIsOpen] = useState(false)
  return (
    <Box w="100%" h="100%" p={10} pl={0}>
      {/* Lesson Title */}
      <Box
        backgroundImage="linear-gradient(to left, #5F53CF, #7EACE2)"
        w="100%"
        h="100px"
        borderTopEndRadius="full"
        borderBottomEndRadius="full"
        transition="background-position 0.5s"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="5xl" fontWeight="bold" color="util.white">
          {lesson.title}
        </Text>
      </Box>
      <Box w="92%" mr="auto" ml="auto">
        {lessonTypeComponentMap[lessonType](lesson)}
        {/* Tabs for Resources and Quiz */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
              Lesson Description
            </Tab>
            {lesson.resources && lesson.resources.length > 0 && (
              <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
                Resources
              </Tab>
            )}
            {lesson.quiz && <Tab>Quiz</Tab>}
            <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
              Discussion
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* Content for Lesson Description Tab */}
              <Text>{lesson.description}</Text>
            </TabPanel>
            {lesson.resources && lesson.resources.length > 0 && (
              <TabPanel>
                {/* Content for Resources Tab */}
                <ul>
                  {lesson.resources.map((resource: Resource) => (
                    <li key={resource.id}>
                      <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="brand.iris"
                      >
                        {resource.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </TabPanel>
            )}
            {lesson && lesson.quiz && (
              <TabPanel>
                {/* Content for Quiz Tab */}
                <Button colorScheme="blue" onClick={() => setIsOpen(true)}>
                  Start Quiz
                </Button>

                {lesson.quiz.quizType === 'dragAndDrop' && isOpen && (
                  <DragAndDropQuizModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    lessonId={lesson.id}
                  />
                )}
                {lesson.quiz.quizType === 'shortAnswer' && isOpen && (
                  <ShortAnswerUI
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    lessonId={lesson.id}
                  />
                )}
                {lesson.quiz.quizType === 'multipleChoice' && isOpen && (
                  <MultipleChoiceModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    lessonId={lesson.id}
                  />
                )}
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default LessonContainer
