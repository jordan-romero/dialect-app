import { Center } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Text } from '@chakra-ui/react'
import Link from 'next/link'

type Props = {
  navText: string
}

const NavComponent = ({ navText }: Props) => {
  const formattedNavText = navText.toLowerCase()

  return (
    <Center
      w="auto"
      h="10"
      p={2}
      borderRadius="md"
      _hover={{ bg: 'brand.lightGreen' }}
    >
      <Text fontSize="xl" as="b" color="black" _hover={{ color: 'brand.pink' }}>
        <Link href={navText === 'Home' ? '/' : `/${formattedNavText}`}>
          {navText}
        </Link>
      </Text>
    </Center>
  )
}

export default NavComponent
