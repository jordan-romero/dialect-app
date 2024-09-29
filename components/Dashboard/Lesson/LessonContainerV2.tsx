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

  const renderQuizzes = () => {
    return lesson.quiz.map((quiz, index) => {
      switch (quiz.quizType) {
        case 'dragAndDrop':
          return (
            <DragAndDropExercise
              key={index}
              lessonId={lesson.id}
              quizIndex={index}
              onComplete={() => console.log('Drag and drop quiz complete')}
            />
          )
        case 'shortAnswer':
          return (
            <ShortAnswerExercise
              key={index}
              lessonId={lesson.id}
              quizIndex={index}
              onComplete={() => console.log('Drag and drop quiz complete')}
            />
          )
        case 'multipleChoice':
          return (
            <MultipleChoiceExercise
              key={index}
              lessonId={lesson.id}
              quizIndex={index}
              onComplete={() => console.log('Drag and drop quiz complete')}
            />
          )
        case 'symbolQuiz':
          return (
            <SymbolExercise
              key={index}
              lessonTitle={lesson.title}
              quizIndex={index}
              onComplete={() => console.log('Drag and drop quiz complete')}
            />
          )
        default:
          return null
      }
    })
  }

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
            {lesson.videoUrl && (
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
            {lesson.quiz && lesson.quiz.length > 0 && (
              <Tab _selected={{ color: 'util.white', bg: 'brand.iris' }}>
                Exercises
              </Tab>
            )}
          </TabList>
          <TabPanels>
            {lesson.videoUrl && (
              <TabPanel>{lessonTypeComponentMap['video'](lesson)}</TabPanel>
            )}
            {lesson.resources && lesson.resources.length > 0 && (
              <TabPanel>
                <Box
                  mb={10}
                  mr="auto"
                  ml="auto"
                  mt={10}
                  overflowY="scroll"
                  minHeight="1000px"
                >
                  <iframe
                    width="95%"
                    height="700px"
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
            {lesson.description && (
              <TabPanel>
                <Text>{lesson.description}</Text>
              </TabPanel>
            )}
            {lesson.quiz && lesson.quiz.length > 0 && (
              <TabPanel>{renderQuizzes()}</TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default LessonContainerV2
