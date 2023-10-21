import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  VStack,
  Image,
  Button,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import useMobileCheck from '../hooks/useMobileCheck'
import NavComponent from './NavComponent'
import Link from 'next/link'
import router from 'next/router'
import { useFeatureFlag } from 'configcat-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

const Navbar = () => {
  const isMobile = useMobileCheck()
  const { value: signUpAndLoginVisible } = useFeatureFlag(
    'signUpAndLoginVisible',
    false,
  )
  const supabaseClient = useSupabaseClient()

  if (isMobile) {
    return <MobileNavbar />
  }

  return (
    <Flex w="100%" h="24" align="center" bgColor={'brand.purple'}>
      <HStack w="100%" justify="space-between">
        <HStack align="center" bgColor={'brand.purple'} spacing={0}>
          <Link href="/">
            <Flex>
              <Image
                src="/actingAccentsLogo.png"
                alt="acting accents logo"
                objectFit="contain"
                h="24"
                mr={-6}
                w="100%"
              />
              <Image
                src="/actingAccentsTitle.png"
                alt="acting accents title"
                objectFit="contain"
                h="20"
              />
            </Flex>
          </Link>
        </HStack>
        <HStack spacing="24px" mr={4} pr={8} justifyContent="end">
          <NavComponent navText="Home" />
          <NavComponent navText="About" />
          <NavComponent navText="Contact" />
          {signUpAndLoginVisible ? <NavComponent navText="Login" /> : null}
          {signUpAndLoginVisible ? (
            <Button
              onClick={async () => {
                await supabaseClient.auth.signOut()
                router.push('/')
              }}
            >
              Logout{' '}
            </Button>
          ) : null}
        </HStack>
      </HStack>
    </Flex>
  )
}

const MobileNavbar = () => {
  const menuItems = ['home', 'about', 'contact']

  return (
    <Box>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Toggle menu"
          icon={<HamburgerIcon />}
          variant="ghost"
        />

        <MenuList>
          <VStack p="4" spacing="4">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => router.push(item === 'home' ? '/' : `/${item}`)}
                textTransform="capitalize"
              >
                {item}
              </MenuItem>
            ))}
          </VStack>
        </MenuList>
      </Menu>
    </Box>
  )
}

export default Navbar
