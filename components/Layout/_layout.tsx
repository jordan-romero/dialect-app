import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import Navbar from './Navbar'
import Footer from './Footer'

interface Props {
  children?: ReactNode
  // any props that come into the component
}

// Lock the whole app to a common large-desktop width: fill the screen (with
// padding) up to 1600px, then cap so it never stretches on huge monitors.
const MAX_APP_WIDTH = '1600px'

const Layout = ({ children }: Props) => {
  return (
    <Box
      w="100%"
      maxW={MAX_APP_WIDTH}
      h="auto"
      mr="auto"
      ml="auto"
      px={{ base: 4, md: 6, lg: 8 }}
    >
      <Navbar />
      {children}
      <Footer />
    </Box>
  )
}

export default Layout
