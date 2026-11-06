import React from 'react'
import { AspectRatio, Box } from '@chakra-ui/react'

const DialectVideo = () => {
  const videoId = 'Ajyd9gDo614'

  return (
    <Box position="relative" w="100%">
      {/* Soft glow behind the video card */}
      <Box
        position="absolute"
        inset="-18px"
        borderRadius="3xl"
        bgGradient="linear(to-br, rgba(114,63,197,0.35), rgba(126,172,226,0.35))"
        filter="blur(28px)"
        opacity={0.55}
        zIndex={0}
      />
      <Box
        position="relative"
        zIndex={1}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="0 24px 60px -16px rgba(30,20,70,0.35), 0 8px 20px -8px rgba(30,20,70,0.2)"
        borderWidth="1px"
        borderColor="whiteAlpha.700"
        bg="black"
      >
        <AspectRatio ratio={16 / 9}>
          <iframe
            title="ActingAccents teaser"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </AspectRatio>
      </Box>
    </Box>
  )
}

export default DialectVideo
