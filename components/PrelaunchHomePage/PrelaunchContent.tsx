import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Box, Text, HStack } from '@chakra-ui/react'

const PrelaunchContent = () => {
  return (
    <Box h='850px' mt='20'>
      <Box
        position="absolute"
        top="55px"
        right="113px"
        bg="brand.lightGreen"
        w="40vw"
        h="90%"
        zIndex="-1"
      ></Box>
      <Flex>
        <Box w="450px" alignContent="center">
          <PrelaunchCta />
        </Box>
        <Box w="65vw" pl="12" pb="10">
          <DialectVideo />
          <Text>This is some fun  catchy text that will make a user want to click on videos and scroll some more</Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default PrelaunchContent
