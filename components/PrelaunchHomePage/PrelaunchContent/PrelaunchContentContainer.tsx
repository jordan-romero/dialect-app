import React from 'react'
import DialectVideo from './DialectVideo'
import PrelaunchCta from './PrelaunchCta'
import { Flex, Spacer, Box } from '@chakra-ui/react'
import PrelaunchMain from './PrelaunchMain'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'
import Fade from 'react-reveal/Fade'
import Zoom from 'react-reveal/Zoom'

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
      <Fade left>
        <Flex direction="column" mt="20">
          <PrelaunchMain />
          <PrelaunchCta />
        </Flex>
      </Fade>
      <Spacer />
      <Box w="100%">
        <Fade right>
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
