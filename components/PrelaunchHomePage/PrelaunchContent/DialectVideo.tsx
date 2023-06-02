import { AspectRatio, Box, useBreakpointValue } from '@chakra-ui/react'
import React from 'react'
import useMobileCheck from '../../hooks/useMobileCheck'

const DialectVideo = () => {
  const boxShadow = useBreakpointValue({ base: 'none', lg: 'dark-lg' })
  const isMobile = useMobileCheck()

  return (
    <Box
      maxW="875px"
      mt={isMobile ? 10 : 20}
      boxShadow={boxShadow}
      w="100%"
      // h="auto"
    >
      <AspectRatio ratio={16 / 9}>
        <video title="acting actors teaser" autoPlay muted controls>
          <source src="/dialectVideoTeaser.mp4" type="video/mp4" />
        </video>
      </AspectRatio>
    </Box>
  )
}

export default DialectVideo
