import { Box } from '@chakra-ui/react'
import React, { ReactNode } from 'react'
interface Props {
  children?: ReactNode
  // any props that come into the component
}

const Navbar = ({ children }: Props) => {
  return (
    <Box w="100%" bg="blue.400">
      Navbar
      {children}
    </Box>
  )
}

export default Navbar
