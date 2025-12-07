import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'

interface PaperProps extends BoxProps {
  elevation?: number
}

const Paper: React.FC<PaperProps> = ({ children, elevation = 1, ...props }) => {
  const shadowColor = 'rgba(0, 0, 0, 0.1)'
  const borderColor = 'rgba(0, 0, 0, 0.05)'

  return (
    <Box
      bg="white"
      borderRadius="md"
      p={4}
      border={`1px solid ${borderColor}`}
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
