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
        <iframe
          title="acting actors teaser"
          src="https://player.vimeo.com/video/292519785?h=87b41e7120"
          allowFullScreen
        />
      </AspectRatio>
    </Box>
  )
}

export default DialectVideo
