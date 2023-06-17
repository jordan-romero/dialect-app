import { Box, Flex, Heading, Progress } from '@chakra-ui/react'
import React from 'react'
import useMidSizeCheck from '../hooks/useMidSizeCheck'

const UnderConstruction = () => {
  const bgImage = '/testimonialsCarousel.svg'
  const isMidSized = useMidSizeCheck()
  return (
    <Flex
      direction="column"
      h="600px"
      justifyContent="center"
      alignItems="center"
      style={
        isMidSized
          ? undefined
          : {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'contain',
            }
      }
    >
      <Heading>Under Construction</Heading>
      <Progress hasStripe value={64} h="34px" zIndex={1} />
    </Flex>
  )
}

export default UnderConstruction
