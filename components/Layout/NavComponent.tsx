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
    <Center w="auto" h="10" p={2} borderRadius="md">
      <Text
        fontSize="xl"
        as="b"
        color="util.white"
        _hover={{ color: 'brand.blueLight' }}
      >
        <Link href={navText === 'Home' ? '/' : `/${formattedNavText}`}>
          {navText}
        </Link>
      </Text>
    </Center>
  )
}

export default NavComponent
