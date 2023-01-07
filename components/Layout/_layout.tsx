import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import Navbar from './Navbar'
import Footer from './Footer'

interface Props {
  children?: ReactNode
  // any props that come into the component
}

const Layout = ({ children }: Props) => {
  return (
    <Box w="95vw" maxW="1500px" h="auto" mr="auto" ml="auto" bg="gray.50">
      <Navbar />
      {children}
      <Footer />
    </Box>
  )
}

export default Layout
