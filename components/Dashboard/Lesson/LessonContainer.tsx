import React from 'react'
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
} from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'

type LessonContainerProps = {
  lesson: Lesson
}

const LessonContainer: React.FC<LessonContainerProps> = ({ lesson }) => {
  return (
    <Box w="100%" h="100%" p={14}>
      {/* Lesson Title */}
      <Box
        backgroundImage="linear-gradient(to left, #7EACE2, #B1F5F4)"
        borderRadius="full"
        transition="background-position 0.5s"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="4xl" fontWeight="bold">
          {lesson.title}
        </Text>
      </Box>
      <Box w="92%" mr="auto" ml="auto">
        {/* Lesson Description */}
        <Text fontSize="lg" mb={4} mt={4}>
          {lesson.description}
        </Text>
        {/* Video */}
        <Box mb={4} mr="auto" ml="auto">
          <iframe
            width="95%"
            height="539"
            src={lesson.videoUrl}
            title={lesson.title}
            allowFullScreen
          ></iframe>
        </Box>

        {/* Tabs for Resources and Quiz */}
        <Tabs variant="enclosed">
          <TabList>
            {lesson.resources && lesson.resources.length > 0 && (
              <Tab>Resources</Tab>
            )}
            {lesson.quiz && <Tab>Quiz</Tab>}
            <Tab>Discussion</Tab>
          </TabList>
          <TabPanels>
            {lesson.resources && lesson.resources.length > 0 && (
              <TabPanel>
                {/* Content for Resources Tab */}
                <ul>
                  {lesson.resources.map((resource: any) => (
                    <li key={resource.id}>
                      <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
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
