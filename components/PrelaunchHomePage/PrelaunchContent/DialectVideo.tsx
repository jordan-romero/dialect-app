import { AspectRatio, Box, useBreakpointValue } from '@chakra-ui/react'
import React from 'react'

const DialectVideo = () => {
  const boxShadow = useBreakpointValue({ base: "none", lg: "dark-lg" });

  return (
    <Box maxW="875px" mt={20} boxShadow={boxShadow} w="100%" h="auto">
      <AspectRatio ratio={16 / 9}>
        <iframe
          title="acting actors teaser"
          src="https://player.vimeo.com/video/292519785?h=87b41e7120"
          allowFullScreen
        />
      </AspectRatio>
    </Box>
  );
};

export default DialectVideo
