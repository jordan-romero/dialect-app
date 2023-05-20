import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Box, Text, HStack, Spacer, Heading } from '@chakra-ui/react'

const PrelaunchContent = () => {
  const heroImg = '/actingAccentsHeroImg.png'
  
  return (
    <Box
      w="100%"
      h="100%"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
      }}
    >
      <Flex>
        <Box w="450px" pt="10" mt="" flexDirection="column" bg="red.100">
          <Heading fontSize="2xl">
            Welcome to the future home of ActingAccents.com!
          </Heading>
          <Text fontSize="lg">
            This website will be a resource for learning various dialects and
            accents for performance purposes. Whether you have a natural gift
            for dialects, or you find the process intimidating, having a
            systematic approach will help you to make more authentic dialect and
            accent choices.
          </Text>
          <PrelaunchCta />
        </Box>
        <Box w="65vw" pl="12" pb="10">
          <DialectVideo />
        </Box>
      </Flex>
    </Box>
  )
}

export default PrelaunchContent
