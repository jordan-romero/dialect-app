import React from 'react'
import PrelaunchCarousel from './PrelaunchCarousel'
import { cards } from './utils'
import { Box, Flex } from '@chakra-ui/react'

const PrelaunchTestimonialsContainer = () => {
  return (
    <Box w="100%" h="100%">
      <Flex h="735px" justify="center" align="center">
        <PrelaunchCarousel cards={cards} />
      </Flex>
    </Box>
  )
}

export default PrelaunchTestimonialsContainer
