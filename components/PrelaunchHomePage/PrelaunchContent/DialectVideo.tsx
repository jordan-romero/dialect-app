import { AspectRatio, Box, useBreakpointValue } from '@chakra-ui/react'
import React from 'react'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'

const DialectVideo = () => {
  const boxShadow = useBreakpointValue({ base: 'none', lg: 'dark-lg' })
  const isMidSized = useMidSizeCheck()
  const videoId = 'Ajyd9gDo614'

  return (
    <Box
      maxW="875px"
      mt={isMidSized ? 10 : 32}
      boxShadow={boxShadow}
      w="100%"
      h="auto"
    >
      <AspectRatio ratio={16 / 9}>
        <iframe
          title="acting actors teaser"
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </AspectRatio>
    </Box>
  )
}

export default DialectVideo
