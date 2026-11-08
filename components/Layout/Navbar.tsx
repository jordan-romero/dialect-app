import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import { useFeatureFlag } from 'configcat-react'
import { useUser } from '@auth0/nextjs-auth0/client'

type NavItem = {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Course', href: '/course' },
  { label: 'About', href: '/about' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact', href: '/contact' },
]

const TOOL_ITEMS: NavItem[] = [{ label: 'IPA Keyboard', href: '/ipa-keyboard' }]

const Navbar = () => {
  const router = useRouter()
  const { value: signUpAndLoginVisible } = useFeatureFlag(
    'signUpAndLoginVisible',
    false,
  )
  const { user: authUser, isLoading: authLoading } = useUser()

  if (router.pathname.startsWith('/dashboard')) return null

  const showAccountActions = signUpAndLoginVisible && !authLoading
  const isAuthenticated = authUser !== undefined
  // Anchor links (e.g. "/#testimonials") shouldn't highlight the whole route
  // as active — they are jump targets, not destination pages.
  const isActive = (href: string) => {
    if (href.includes('#')) return false
    return href === '/'
      ? router.pathname === '/'
      : router.pathname === href || router.pathname.startsWith(href + '/')
  }

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg="whiteAlpha.900"
      backdropFilter="saturate(180%) blur(12px)"
      borderBottomWidth="1px"
      borderBottomColor="blackAlpha.100"
      mx={{ base: -4, md: -6, lg: -8 }}
    >
      <Flex
        maxW="1600px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        h={{ base: 16, md: 20 }}
        align="center"
        justify="space-between"
        gap={4}
      >
        {/* Brand */}
        <NextLink href="/" passHref legacyBehavior>
          <Link
            display="inline-flex"
            alignItems="baseline"
            flexShrink={0}
            _hover={{ textDecoration: 'none' }}
            aria-label="ActingAccents home"
          >
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="black"
              letterSpacing="-0.02em"
              color="gray.900"
              lineHeight="1"
            >
              Acting
              <Box
                as="span"
                bgGradient="linear(to-r, brand.purple, brand.iris)"
                bgClip="text"
              >
                Accents
              </Box>
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="semibold"
              color="gray.400"
              lineHeight="1"
              ml={0.5}
            >
              .com
            </Text>
          </Link>
        </NextLink>

        {/* Desktop nav */}
        <HStack
          as="nav"
          spacing={1}
          display={{ base: 'none', lg: 'flex' }}
          flex="1"
          justify="center"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              color="gray.700"
              fontSize="md"
              fontWeight="semibold"
              px={4}
              _hover={{ bg: 'blackAlpha.50', color: 'brand.purple' }}
              _active={{ bg: 'blackAlpha.50' }}
            >
              Tools
            </MenuButton>
            <MenuList
              borderRadius="xl"
              borderColor="blackAlpha.100"
              boxShadow="0 12px 32px -12px rgba(17,24,39,0.18)"
              py={2}
            >
              {TOOL_ITEMS.map((tool) => (
                <MenuItem
                  key={tool.href}
                  onClick={() => router.push(tool.href)}
                  fontWeight="medium"
                  _hover={{ bg: 'purple.50', color: 'brand.purple' }}
                >
                  {tool.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>

        {/* Desktop account actions / CTA */}
        <HStack spacing={3} display={{ base: 'none', lg: 'flex' }}>
          {showAccountActions && isAuthenticated && (
            <>
              <NavLink
                href="/dashboard"
                label="Dashboard"
                active={isActive('/dashboard')}
              />
              <Button
                as={NextLink}
                href="/api/auth/logout"
                size="sm"
                variant="ghost"
                fontWeight="semibold"
                color="gray.700"
                _hover={{ bg: 'blackAlpha.50', color: 'brand.purple' }}
              >
                Logout
              </Button>
            </>
          )}
          {showAccountActions && !isAuthenticated && (
            <Button
              as={NextLink}
              href="/api/auth/login"
              size="sm"
              variant="ghost"
              fontWeight="semibold"
              color="gray.700"
              _hover={{ bg: 'blackAlpha.50', color: 'brand.purple' }}
            >
              Login
            </Button>
          )}
          <Button
            as={NextLink}
            href="/#early-access"
            size="sm"
            px={5}
            borderRadius="full"
            fontWeight="semibold"
            color="white"
            bgGradient="linear(to-r, brand.purple, brand.iris)"
            boxShadow="0 8px 20px -8px rgba(114,63,197,0.5)"
            _hover={{
              bgGradient: 'linear(to-r, brand.purpleLight, brand.purple)',
              transform: 'translateY(-1px)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="transform 0.15s"
          >
            Get early access
          </Button>
        </HStack>

        {/* Mobile menu */}
        <Box display={{ base: 'flex', lg: 'none' }}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Open navigation menu"
              icon={<HamburgerIcon boxSize={5} />}
              variant="ghost"
              color="gray.700"
              _hover={{ bg: 'blackAlpha.50', color: 'brand.purple' }}
            />
            <MenuList
              minW="14rem"
              borderRadius="xl"
              borderColor="blackAlpha.100"
              boxShadow="0 12px 32px -12px rgba(17,24,39,0.18)"
              py={2}
            >
              {NAV_ITEMS.map((item) => (
                <MenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  fontWeight="medium"
                  _hover={{ bg: 'purple.50', color: 'brand.purple' }}
                >
                  {item.label}
                </MenuItem>
              ))}
              <MenuDivider />
              {TOOL_ITEMS.map((tool) => (
                <MenuItem
                  key={tool.href}
                  onClick={() => router.push(tool.href)}
                  fontWeight="medium"
                  _hover={{ bg: 'purple.50', color: 'brand.purple' }}
                >
                  {tool.label}
                </MenuItem>
              ))}
              {showAccountActions && (
                <>
                  <MenuDivider />
                  {isAuthenticated ? (
                    <>
                      <MenuItem
                        onClick={() => router.push('/dashboard')}
                        fontWeight="medium"
                        _hover={{ bg: 'purple.50', color: 'brand.purple' }}
                      >
                        Dashboard
                      </MenuItem>
                      <MenuItem
                        onClick={() => router.push('/api/auth/logout')}
                        fontWeight="medium"
                        _hover={{ bg: 'purple.50', color: 'brand.purple' }}
                      >
                        Logout
                      </MenuItem>
                    </>
                  ) : (
                    <MenuItem
                      onClick={() => router.push('/api/auth/login')}
                      fontWeight="medium"
                      _hover={{ bg: 'purple.50', color: 'brand.purple' }}
                    >
                      Login
                    </MenuItem>
                  )}
                </>
              )}
              <MenuDivider />
              <Box px={3} py={2}>
                <Button
                  as={NextLink}
                  href="/#early-access"
                  size="sm"
                  w="100%"
                  borderRadius="full"
                  color="white"
                  bgGradient="linear(to-r, brand.purple, brand.iris)"
                  _hover={{
                    bgGradient: 'linear(to-r, brand.purpleLight, brand.purple)',
                  }}
                >
                  Get early access
                </Button>
              </Box>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  )
}

type NavLinkProps = {
  href: string
  label: string
  active?: boolean
}

const NavLink = ({ href, label, active }: NavLinkProps) => (
  <NextLink href={href} passHref legacyBehavior>
    <Link
      px={4}
      py={2}
      borderRadius="md"
      fontSize="md"
      fontWeight="semibold"
      color={active ? 'brand.purple' : 'gray.700'}
      position="relative"
      _hover={{ textDecoration: 'none', color: 'brand.purple' }}
      _after={
        active
          ? {
              content: '""',
              position: 'absolute',
              left: '16px',
              right: '16px',
              bottom: '2px',
              height: '2px',
              borderRadius: 'full',
              bgGradient: 'linear(to-r, brand.purple, brand.iris)',
            }
          : undefined
      }
    >
      {label}
    </Link>
  </NextLink>
)

export default Navbar
