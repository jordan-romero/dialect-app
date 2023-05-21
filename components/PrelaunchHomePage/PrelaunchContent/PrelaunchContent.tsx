import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Spacer, useBreakpointValue } from '@chakra-ui/react'
import PrelaunchMain from './PrelaunchMain'
import useMobileCheck from '../../hooks/useMobileCheck'

const PrelaunchContent = () => {
  const isMobile = useMobileCheck()

  if (isMobile) {
    return (
      <Flex direction="column" mt={4}>
        <PrelaunchContentMobile />
      </Flex>
    );
  }
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
const PrelaunchContentMobile = () => {
  return (
    <Flex w='100%' h='1300px' pb="10" direction='column'>
      <DialectVideo />
      <PrelaunchMain /> 
      <PrelaunchCta />
    </Flex>
  )
};

export default PrelaunchContent
