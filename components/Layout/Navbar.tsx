import { ArrowRightIcon } from '@chakra-ui/icons'
import { Text, Flex, Heading, HStack, VStack, Spacer } from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import NavComponent from './NavComponent'

const Navbar = () => {
  return (
    <Flex w="100%" h="14">
      <HStack ml={4}>
        <ArrowRightIcon boxSize={8} color="green.400" />
        <Heading>Acting Accents</Heading>
      </HStack>
      <Spacer />
      <HStack spacing="24px" mr={4}>
        <NavComponent navText="Home" />
        <NavComponent navText="About" />
        <NavComponent navText="Testimonials" />
        <NavComponent navText="Contact" />
      </HStack>
    </Flex>
  )
}

export default Navbar
