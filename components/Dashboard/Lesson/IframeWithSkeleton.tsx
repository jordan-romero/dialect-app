import React, { useState } from 'react'
import { Box, Skeleton } from '@chakra-ui/react'

interface Props {
  src: string
  title: string
  height?: string
  width?: string
}

// An iframe (video / PDF viewer) with a skeleton placeholder shown until it
// finishes loading, so there's no blank gap while the content streams in.
const IframeWithSkeleton: React.FC<Props> = ({
  src,
  title,
  height = '500px',
  width = '95%',
}) => {
  const [loaded, setLoaded] = useState(false)
  return (
    <Box position="relative" w={width} mx="auto" h={height}>
      {!loaded && <Skeleton position="absolute" inset={0} borderRadius="md" />}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 8,
        }}
      />
    </Box>
  )
}

export default IframeWithSkeleton
