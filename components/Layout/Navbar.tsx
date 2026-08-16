import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons'
import {
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Image,
  Button,
  MenuDivider,
  useMediaQuery,
} from '@chakra-ui/react'
import React from 'react'
import NavComponent from './NavComponent'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFeatureFlag } from 'configcat-react'
import Login from '../AuthComponents/Login'
import Logout from '../AuthComponents/Logout'
import { useUser } from '@auth0/nextjs-auth0/client'

const Navbar = () => {
  // The desktop links need more room than a phone-sized breakpoint provides,
  // especially when the account actions are visible.
  const [isCompactNav] = useMediaQuery('(max-width: 1440px)')
  const { value: signUpAndLoginVisible } = useFeatureFlag(
    'signUpAndLoginVisible',
    false,
  )
  const { user: authUser, isLoading: authLoading } = useUser()
  const router = useRouter()

  if (router.pathname.includes('dashboard')) {
    return null
  }

  if (isCompactNav) {
    return (
      <MobileNavbar
        showAccountActions={signUpAndLoginVisible && !authLoading}
        isAuthenticated={authUser !== undefined}
      />
    )
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

          {signUpAndLoginVisible && !authLoading && authUser === undefined ? (
            <Login />
          ) : null}
          {signUpAndLoginVisible && !authLoading && authUser !== undefined ? (
            <>
              <NavComponent navText="Dashboard" />
              <Logout />
            </>
          ) : null}
        </HStack>
      </HStack>
    </Flex>
  )
}

type MobileNavbarProps = {
  showAccountActions: boolean
  isAuthenticated: boolean
}

const MobileNavbar = ({
  showAccountActions,
  isAuthenticated,
}: MobileNavbarProps) => {
  const router = useRouter()

  return (
    <Flex
      w="100%"
      h="20"
      px={{ base: 2, sm: 4 }}
      align="center"
      justify="space-between"
      bgColor="brand.purple"
    >
      <Link href="/" aria-label="Acting Accents home">
        <Flex align="center" minW={0}>
          <Image
            src="/actingAccentsLogo.png"
            alt="acting accents logo"
            objectFit="contain"
            h={{ base: 16, sm: 18, lg: 20 }}
            w="auto"
          />
          <Image
            src="/actingAccentsTitle.png"
            alt="Acting Accents"
            objectFit="contain"
            display={{ base: 'none', sm: 'block' }}
            w={{ sm: '205px', md: '260px', lg: '360px', xl: '420px' }}
            h="auto"
            ml={-2}
          />
        </Flex>
      </Link>

      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Open navigation menu"
          icon={<HamburgerIcon />}
          variant="ghost"
          color="util.white"
          fontSize="2xl"
          _hover={{ color: 'brand.blueLight', bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
        />

        <MenuList minW="13rem" py={2}>
          <MenuItem onClick={() => router.push('/about')}>About</MenuItem>
          <MenuItem onClick={() => router.push('/contact')}>Contact</MenuItem>
          <MenuDivider />
          <MenuItem onClick={() => router.push('/ipa-keyboard')}>
            Tools: IPA Keyboard
          </MenuItem>
          {showAccountActions ? (
            <>
              <MenuDivider />
              {isAuthenticated ? (
                <>
                  <MenuItem onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/api/auth/logout')}>
                    Logout
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={() => router.push('/api/auth/login')}>
                  Login
                </MenuItem>
              )}
            </>
          ) : null}
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default Navbar
