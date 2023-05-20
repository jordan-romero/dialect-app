import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Spacer } from '@chakra-ui/react'
import PrelaunchMain from './PrelaunchMain'

const PrelaunchContent = () => {

  
  return (
    
      <Flex direction='row'>
        <Flex direction='column' mt='40'>
          <PrelaunchMain />
          <PrelaunchCta />
        </Flex>
        <Spacer />
        <Flex justifyContent="flex-end" w="100%" h="auto" pb="10" pt='10' mt="20">
          <DialectVideo />
        </Flex>
      </Flex>

  )
}

export default PrelaunchContent
