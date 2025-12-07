import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  VStack,
  Image,
  Button,
  Text,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import useMobileCheck from '../hooks/useMobileCheck'
import NavComponent from './NavComponent'
import Link from 'next/link'
import router from 'next/router'
import { useRouter } from 'next/router'
import { useFeatureFlag } from 'configcat-react'
import Login from '../AuthComponents/Login'
import Logout from '../AuthComponents/Logout'
import { useUser } from '@auth0/nextjs-auth0/client'

const Navbar = () => {
  const isMobile = useMobileCheck()
  const { value: signUpAndLoginVisible } = useFeatureFlag(
    'signUpAndLoginVisible',
    false,
  )
  const user = useUser()
  const router = useRouter()

  if (isMobile && !router.pathname.includes('dashboard')) {
    return <MobileNavbar />
  }

  return !isMobile && !router.pathname.includes('dashboard') ? (
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

          {/* Tools Dropdown */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              color="util.white"
              fontSize="xl"
              fontWeight="bold"
              _hover={{ color: 'brand.blueLight', bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
            >
              Tools
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => router.push('/ipa-keyboard')}>
                IPA Keyboard
              </MenuItem>
            </MenuList>
          </Menu>

          {signUpAndLoginVisible && user.user === undefined ? <Login /> : null}
          {signUpAndLoginVisible && user.user !== undefined ? (
            <NavComponent navText="Dashboard" />
          ) : null}
          {signUpAndLoginVisible && user ? <Logout /> : null}
        </HStack>
      </HStack>
    </Flex>
  ) : null
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
          <VStack p="4" spacing="4" align="stretch">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => router.push(item === 'home' ? '/' : `/${item}`)}
                textTransform="capitalize"
              >
                {item}
              </MenuItem>
            ))}

            {/* Tools submenu */}
            <Box pl={2}>
              <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.600">
                Tools
              </Text>
              <MenuItem onClick={() => router.push('/ipa-keyboard')} pl={4}>
                IPA Keyboard
              </MenuItem>
            </Box>
          </VStack>
        </MenuList>
      </Menu>
    </Box>
  )
}

export default Navbar
