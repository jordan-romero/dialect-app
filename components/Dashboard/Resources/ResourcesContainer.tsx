import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  VStack,
  List,
  ListItem,
  Flex,
  Spacer,
  Divider,
} from '@chakra-ui/react'

interface Resource {
  id: number
  name: string
  type: string
  url: string
  courseId: number | null
  lessonId: number
}

interface Lesson {
  id: number
  title: string
  resources: Resource[]
}

const ResourcesContainer = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  )

  useEffect(() => {
    // Fetch lessons with associated resources
    fetch('/api/lessons')
      .then((response) => response.json())
      .then((data: Lesson[]) => {
        if (Array.isArray(data)) {
          setLessons(data)
          if (data.length > 0 && data[0].resources.length > 0) {
            setSelectedResource(data[0].resources[0])
          }
        } else {
          console.error('Invalid lessons API response format')
        }
      })
      .catch((error) => {
        console.error('Error fetching lessons:', error)
      })
  }, [])

  return (
    <Flex>
      <Box
        width="30%"
        p={6}
        bg="util.gray"
        borderRight="1px"
        borderColor="util.mediumGray"
      >
        <Heading as="h2" size="xl" mb={6} color="brand.purple">
          Resources
        </Heading>
        <VStack align="stretch" spacing={8}>
          {lessons.map((lesson) => (
            <Box key={lesson.id}>
              <Heading as="h3" size="lg" mb={4} color="brand.iris">
                {lesson.title}
              </Heading>
              <List spacing={2}>
                {lesson.resources.map((resource) => (
                  <ListItem
                    key={resource.id}
                    onClick={() => setSelectedResource(resource)}
                    cursor="pointer"
                    color="brand.blue"
                    _hover={{ color: 'brand.purpleLight' }}
                  >
                    {resource.name}
                  </ListItem>
                ))}
              </List>
              <Divider my={4} borderColor="util.mediumGray" />
            </Box>
          ))}
        </VStack>
      </Box>
      <Spacer />
      <Box width="70%" p={6}>
        {selectedResource && (
          <Box
            as="iframe"
            src={selectedResource.url}
            title={selectedResource.name}
            width="100%"
            height="600px"
            border="none"
            borderRadius="md"
            boxShadow="lg"
            position="sticky"
            top="0"
            zIndex="1"
          />
        )}
      </Box>
    </Flex>
  )
}

export default ResourcesContainer
