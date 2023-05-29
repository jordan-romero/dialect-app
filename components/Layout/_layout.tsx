import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import Navbar from './Navbar'
import Footer from './Footer'
import useMobileCheck from '../hooks/useMobileCheck'

interface Props {
  children?: ReactNode
  // any props that come into the component
}

const Layout = ({ children }: Props) => {
  const isMobile = useMobileCheck()
  return (
    <Box
      w={isMobile ? '90vw' : '95vw'}
      maxW="1500px"
      h="auto"
      mr="auto"
      ml="auto"
    >
      <Navbar />
      {children}
      <Footer />
    </Box>
  )
}

export default Layout
