import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent'
import PrelaunchFooter from './PrelaunchFooter'

const PrelaunchHomePage = () => {
  return (
    <Box w='90vw' h='100vh'>
      <PrelaunchContent />
      <Box>
        <PrelaunchFooter />
      </Box>
    </Box>
  )
}

export default PrelaunchHomePage
