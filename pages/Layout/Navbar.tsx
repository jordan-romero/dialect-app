import { Box } from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import NavComponent from './NavComponent'


const Navbar = () => {
  return (
    <Box w="100%" bg="blue.400">
      Navbar
      <NavComponent />
    </Box>
  )
}

export default Navbar
