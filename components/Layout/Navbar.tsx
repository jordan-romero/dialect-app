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
} from '@chakra-ui/react'
import React, { useState } from 'react'
import useMobileCheck from '../hooks/useMobileCheck'
import NavComponent from './NavComponent'
import Link from 'next/link'
import router from 'next/router'
import { useFeatureFlag } from 'configcat-react'
import Login from '../AuthComponents/Login'
import Logout from '../AuthComponents/Logout'

const Navbar = () => {
  const isMobile = useMobileCheck()
  const { value: signUpAndLoginVisible } = useFeatureFlag(
    'signUpAndLoginVisible',
    false,
  )

  if (isMobile) {
    return <MobileNavbar />
  }

  return (
    <Flex w="100%" h="14" align="center">
      <HStack w="100%" spacing={0} justify="space-between">
        <HStack align="center">
          <Link href="/">
            <Image
              src="/actingAccentsLogo.png"
              alt="acting accents logo"
              objectFit="contain"
              w="48"
              h="14"
            />
          </Link>
        </HStack>
        <HStack spacing="24px" mr={4} pr={8} justifyContent="end">
          <NavComponent navText="Home" />
          <NavComponent navText="About" />
          <NavComponent navText="Contact" />
          {/* {signUpAndLoginVisible ? <Login navText="Sign Up" /> : null} */}
          {signUpAndLoginVisible ? <Login /> : null}
          {signUpAndLoginVisible ? <Logout /> : null}
        </HStack>
      </HStack>
    </Flex>
  )
}

const MobileNavbar = () => {
  const [menuItems, setMenuItems] = useState(['home', 'about', 'contact'])

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
