import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Spacer, Box } from '@chakra-ui/react'
import PrelaunchMain from './PrelaunchMain'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'
import { Slide } from 'react-awesome-reveal'
import { Fade } from 'react-awesome-reveal'

const PrelaunchContent = () => {
  const isMidSized = useMidSizeCheck()

  if (isMidSized) {
    return (
      <Flex direction="column" mt={isMidSized ? 0 : 2}>
        <PrelaunchContentMobile />
      </Flex>
    )
  }

  return (
    <Flex direction="row">
      <Slide direction="left" triggerOnce={true}>
        <Flex direction="column" mt="20">
          <PrelaunchMain />
          <PrelaunchCta />
        </Flex>
      </Slide>
      <Spacer />
      <Box w="100%">
        <Fade duration={2000} triggerOnce={true}>
          <Flex
            justifyContent="flex-end"
            w="100%"
            h="500px"
            pb="10"
            pt="15"
            mt="20"
          >
            <DialectVideo />
          </Flex>
        </Fade>
      </Box>
    </Flex>
  )
}
const PrelaunchContentMobile = () => {
  return (
    <Flex w="100%" h="1300px" pb="10" direction="column">
      <DialectVideo />
      <PrelaunchMain />
      <PrelaunchCta />
    </Flex>
  )
}

export default PrelaunchContent
