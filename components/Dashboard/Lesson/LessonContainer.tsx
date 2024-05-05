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
        {/* Video */}
        {lesson.videoUrl ? (
          <Box mb={10} mr="auto" ml="auto" mt={10}>
            <iframe
              width="95%"
              height="539"
              src={lesson.videoUrl}
              title={lesson.title}
              allowFullScreen
            ></iframe>
            <Checkbox
              size="lg"
              colorScheme="green"
              mt={10}
              isChecked={isCompleted}
              onChange={handleLessonComplete}
            >
              {isCompleted ? 'Lesson Completed' : 'Mark as Completed'}
            </Checkbox>
          </Box>
        ) : lesson.resources && lesson.resources.length > 0 ? (
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
            <Checkbox
              size="lg"
              colorScheme="green"
              mt={10}
              isChecked={isCompleted}
              onChange={handleLessonComplete}
            >
              {isCompleted ? 'Lesson Completed' : 'Mark as Completed'}
            </Checkbox>
          </Box>
        ) : (
          <SymbolQuiz lessonTitle={lesson.title} />
        )}

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
