import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent'
import PrelaunchFooter from './PrelaunchFooter'

const PrelaunchHomePage = () => {
  return (
    <Box>
      <PrelaunchContent />
      <Box bg='white'>
        <PrelaunchFooter />
      </Box>
    </Box>
  )
}

export default PrelaunchHomePage
