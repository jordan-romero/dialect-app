// LessonContainerV2.tsx
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
  Flex,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Lesson, Resource } from '../Course/courseTypes'
import { lessonTypeComponentMap } from './utils'
import DragAndDropExercise from '../Exercises/DragAndDropExercise/DragAndDropExercise'
import MultipleChoiceExercise from '../Exercises/MultipleChoiceExercise'
import ShortAnswerExercise from '../Exercises/ShortAnswerExercise'
import SymbolExercise from '../Exercises/SymbolExercise'

type LessonContainerProps = {
  lesson: Lesson
}

const LessonContainerV2: React.FC<LessonContainerProps> = ({ lesson }) => {
  const [selectedTab, setSelectedTab] = useState(0)

  console.log(lesson, 'lesson')

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

  if (!lesson) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Alert status="error">
          <AlertIcon />
          No lesson data available
        </Alert>
      </Flex>
    )
  }

  const lessonType = getLessonType(lesson)

  return (
    <Box w="100%" h="100%" p={10} pl={0} overflowY="auto">
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
      <Box w="92%" mr="auto" ml="auto" mt="8">
        <Tabs
          variant="enclosed"
          index={selectedTab}
          onChange={(index) => setSelectedTab(index)}
        >
          <TabList justifyContent="flex-end">
            {lessonType === 'video' && (
              <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
                Video
              </Tab>
            )}
            {lesson.resources && lesson.resources.length > 0 && (
              <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
                Handouts
              </Tab>
            )}
            {lesson.description && (
              <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
                Description
              </Tab>
            )}
            {lesson.quiz && (
              <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
                Exercises
              </Tab>
            )}
          </TabList>
          <TabPanels>
            {lessonType === 'video' && (
              <TabPanel>{lessonTypeComponentMap[lessonType](lesson)}</TabPanel>
            )}
            {lesson.resources && lesson.resources.length > 0 && (
              <TabPanel>
                <Box
                  mb={10}
                  mr="auto"
                  ml="auto"
                  mt={10}
                  maxHeight="539px"
                  overflowY="scroll"
                >
                  <iframe
                    width="95%"
                    height="500px"
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                      lesson.resources[0].url,
                    )}&embedded=true`}
                    title={lesson.resources[0].name}
                    allowFullScreen
                  ></iframe>
                </Box>
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
            <TabPanel>
              <Text>{lesson.description}</Text>
            </TabPanel>
            {lesson.quiz && (
              <TabPanel>
                {lesson.quiz.quizType === 'dragAndDrop' && (
                  <DragAndDropExercise lessonId={lesson.id} />
                )}
                {lesson.quiz.quizType === 'shortAnswer' && (
                  <ShortAnswerExercise lessonId={lesson.id} />
                )}
                {lesson.quiz.quizType === 'multipleChoice' && (
                  <MultipleChoiceExercise lessonId={lesson.id} />
                )}
                {lesson.quiz.quizType === 'symbolQuiz' && (
                  <SymbolExercise lessonTitle={lesson.title} />
                )}
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default LessonContainerV2
