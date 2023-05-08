import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Box, VStack, HStack } from '@chakra-ui/react'

const PrelaunchContent = () => {
  return (
    <Box>
        <Box position='absolute' top='57px' right='63px' bg='brand.lightGreen' w='600px' h='90%' zIndex='-1'/>
        <Flex>
            <Box w='450px' alignContent='center'>
                <PrelaunchCta />
            </Box>
            <Box w='65vw' pl='10' pb='10'>
                <DialectVideo />
            </Box>
        </Flex>
    </Box>
  )
}

export default PrelaunchContent