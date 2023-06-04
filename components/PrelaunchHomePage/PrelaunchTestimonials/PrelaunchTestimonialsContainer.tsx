import React from 'react'
import PrelaunchCarousel from './PrelaunchCarousel'
import { cards } from './utils'
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'

const PrelaunchTestimonialsContainer = () => {
  const testimonialContainerHeight = useBreakpointValue({
    base: '700px',
    md: '700px',
    lg: '735px',
  })
  return (
    <Box w="100%" h="100%">
      <Flex h={testimonialContainerHeight} justify="center" align="center">
        <PrelaunchCarousel cards={cards} />
      </Flex>
    </Box>
  )
}

export default PrelaunchTestimonialsContainer
