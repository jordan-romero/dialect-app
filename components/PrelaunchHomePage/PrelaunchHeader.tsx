import { Box, Flex, Spacer, Text } from '@chakra-ui/react'
import React from 'react'

const PrelaunchHeader = () => {
  return (
    <Flex align="center" h="100%">
      <Box px={8}>
        <Text>Dialect Class Name</Text>
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
