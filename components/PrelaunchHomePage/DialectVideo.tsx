import { AspectRatio } from '@chakra-ui/react'
import React from 'react'

const DialectVideo = () => {
  return (
    <AspectRatio
      maxW="700px"
      maxH="400px"
      ratio={1}
      mr="auto"
      ml="auto"
      mt={10}
      boxShadow="dark-lg"
    >
      <iframe
        title="dialect class teaser"
        src="https://player.vimeo.com/video/292519785?h=87b41e7120"
        allowFullScreen
      />
    </AspectRatio>
  )
}

export default DialectVideo
