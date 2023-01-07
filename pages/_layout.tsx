import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

interface Props {
    children?: ReactNode
    // any props that come into the component
}

const Layout = ({ children }: Props) => {
  return (
    <Box maxW="95vw"maxH="100vh" mr="auto" ml="auto" bg='gray.50'>
        {children}
    </Box>
  )
}

export default Layout