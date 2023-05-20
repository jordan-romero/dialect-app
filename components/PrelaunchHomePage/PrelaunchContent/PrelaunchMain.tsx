import { Flex, Heading, Spacer, Text } from '@chakra-ui/react'
import React from 'react'

const PrelaunchMain = () => {
  return (
        <Flex w="575px" h="375px" flexDirection="column">
          <Heading fontSize="4xl" fontWeight='black' lineHeight='1.25'>
            Welcome to the future home of <Text color="brand.purple">ActingAccents.com!</Text>
          </Heading>
          <Text fontSize="lg" mt='7' w="85%" >
            This website will be a resource for learning various dialects and
            accents for performance purposes. Whether you have a natural gift
            for dialects, or you find the process intimidating, having a
            systematic approach will help you to make more authentic dialect and
            accent choices.
          </Text>
          <Text fontSize='lg' fontWeight='extrabold' mt='5' w='85%'>
            Ultimately, this course will teach you to teach yourself any dialect or accent you desire. 
          </Text>
         
        </Flex>
  )
}

export default PrelaunchMain