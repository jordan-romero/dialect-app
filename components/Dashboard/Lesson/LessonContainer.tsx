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

type LessonContainerProps = {
  lesson: Lesson
  totalLessons: number
}

const LessonContainer: React.FC<LessonContainerProps> = ({
  lesson,
  totalLessons,
}) => {
  const [isCompleted, setIsCompleted] = useState(false)

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
        <Box mb={10} mr="auto" ml="auto" mt={10}>
          <iframe
            width="95%"
            height="539"
            src={lesson.videoUrl}
            title={lesson.title}
            allowFullScreen
          ></iframe>

          <Checkbox size="lg" colorScheme="green" mt={10}>
            Mark as Watched
          </Checkbox>
        </Box>

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
            {lesson.quiz && (
              <TabPanel>
                {/* Content for Quiz Tab */}
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    /* Handle quiz start */
                  }}
                >
                  Start Quiz
                </Button>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default LessonContainer
