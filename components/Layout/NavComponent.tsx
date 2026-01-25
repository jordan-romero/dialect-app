import { Center } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Text } from '@chakra-ui/react'
import Link from 'next/link'

type Props = {
  navText: string
  href?: string
}

const NavComponent = ({ navText, href }: Props) => {
  const formattedNavText = navText.toLowerCase()
  const linkHref = href || (navText === 'Home' ? '/' : `/${formattedNavText}`)

  return (
    <Center w="auto" h="10" p={2} borderRadius="md">
      <Text
        fontSize="xl"
        as="b"
        color="util.white"
        _hover={{ color: 'brand.blueLight' }}
      >
        <Link href={linkHref}>{navText}</Link>
      </Text>
    </Center>
  )
}

export default NavComponent
