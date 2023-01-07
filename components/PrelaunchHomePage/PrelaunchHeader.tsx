import { Box, Flex, Heading, Spacer, Text } from '@chakra-ui/react'
import React from 'react'

const PrelaunchHeader = () => {
  return (
    <Flex align="center" h="100%">
      <Box px={8}>
        <Heading as='h3' size='lg'>Dialect Class Name</Heading>
        <Text>Catchy Dialect Class Slogan</Text>
      </Box>
      <Spacer />
      <Box px={8}>
        <Text>
          a really delightful interesting quote about dialect classes and
          services
        </Text>
        <Text>Who said that? - age F etc</Text>
      </Box>
    </Flex>
  )
}

export default PrelaunchHeader
