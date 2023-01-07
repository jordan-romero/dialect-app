import { Box, Flex, HStack } from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import NavComponent from './NavComponent'

const Navbar = () => {
  return (
    <Flex w="100%" bg="blue.400" h="14">
      <HStack spacing="24px">
        <NavComponent navText="Home" />
        <NavComponent navText="About" />
        <NavComponent navText="Contact" />
      </HStack>
    </Flex>
  )
}

export default Navbar
