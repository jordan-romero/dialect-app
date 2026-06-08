import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'

interface PaperProps extends BoxProps {
  elevation?: number
}

const Paper: React.FC<PaperProps> = ({ children, elevation = 1, ...props }) => {
  const shadowColor = 'rgba(0, 0, 0, 0.1)'

  return (
    <Box
      bg="surface.card"
      color="text.primary"
      borderRadius="md"
      p={4}
      borderWidth="1px"
      borderColor="border.subtle"
      boxShadow={`
        0 -1px 1px ${shadowColor},
        0 1px 1px ${shadowColor},
        0 2px 2px ${shadowColor},
        0 4px 4px ${shadowColor},
        0 ${elevation * 2}px ${elevation * 2}px ${shadowColor}
      `}
      {...props}
    >
      {children}
    </Box>
  )
}

export default Paper
