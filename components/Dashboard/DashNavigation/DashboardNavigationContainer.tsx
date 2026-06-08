import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Avatar,
  Image,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import {
  FiPlayCircle,
  FiBookOpen,
  FiGrid,
  FiHelpCircle,
  FiUser,
  FiLogOut,
  FiMenu,
} from 'react-icons/fi'
import { MdKeyboard } from 'react-icons/md'
import { IconType } from 'react-icons'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProfileModal from '../Profile/ProfileModal'

const HELP_EMAIL = 'info@actingaccents.com'
const RAIL_COLLAPSED = '72px'
const RAIL_EXPANDED = '210px'

interface NavItemProps {
  icon: IconType
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  /** When set, the avatar image replaces the icon (e.g. the Profile item). */
  avatarSrc?: string
  /** Always show the label (drawer mode) instead of revealing it on hover. */
  showLabel?: boolean
  /** Called after any activation — used to close the mobile drawer. */
  onNavigate?: () => void
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  onClick,
  active,
  avatarSrc,
  showLabel,
  onNavigate,
}) => {
  const handleClick = () => {
    onClick?.()
    onNavigate?.()
  }

  const row = (
    <Flex
      w="100%"
      h="48px"
      align="center"
      overflow="hidden"
      borderRadius="xl"
      cursor="pointer"
      color="util.white"
      bg={active ? 'whiteAlpha.300' : 'transparent'}
      transition="background 0.15s ease"
      _hover={{ bg: 'whiteAlpha.200' }}
    >
      {/* Fixed-width slot = collapsed inner width, so the icon is centered in
          the bar when collapsed and stays put when the rail expands. */}
      <Flex w="56px" flexShrink={0} align="center" justify="center">
        {avatarSrc ? (
          <Avatar size="sm" src={avatarSrc} name={label} />
        ) : (
          <Icon as={icon} boxSize={6} />
        )}
      </Flex>
      <Text
        fontSize="sm"
        fontWeight="medium"
        whiteSpace="nowrap"
        opacity={showLabel ? 1 : 0}
        transition="opacity 0.15s ease"
        _groupHover={{ opacity: 1 }}
      >
        {label}
      </Text>
    </Flex>
  )

  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        style={{ textDecoration: 'none', width: '100%' }}
      >
        {row}
      </Link>
    )
  }
  return (
    <Box as="button" onClick={handleClick} aria-label={label} w="100%">
      {row}
    </Box>
  )
}

const DashboardNavigationContainer = () => {
  const router = useRouter()
  const path = router.pathname
  const profile = useDisclosure()
  const menu = useDisclosure() // mobile nav drawer
  const [avatarSrc, setAvatarSrc] = useState('')

  const loadAvatar = useCallback(() => {
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setAvatarSrc(d.avatar || d.authPicture || '')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadAvatar()
    const handler = () => loadAvatar()
    window.addEventListener('profile:updated', handler)
    return () => window.removeEventListener('profile:updated', handler)
  }, [loadAvatar])

  const getHelp = () => {
    const subject = encodeURIComponent('Help with Acting Accents')
    const body = encodeURIComponent(
      'Hi, I could use some help with the following:\n\n(What are you stuck on?)\n\n— Sent from the Acting Accents dashboard',
    )
    window.open(`mailto:${HELP_EMAIL}?subject=${subject}&body=${body}`)
  }

  // Nav items shared by the desktop rail (labels reveal on hover) and the mobile
  // drawer (labels always shown; selecting an item closes the drawer).
  type NavOpts = { showLabel?: boolean; onNavigate?: () => void }
  const mainNav = (opts?: NavOpts) => (
    <VStack spacing={2} align="stretch" px={2} mt={3}>
      <NavItem
        icon={FiGrid}
        label="Dashboard"
        href="/dashboard/progress"
        active={path === '/dashboard/progress'}
        {...opts}
      />
      <NavItem
        icon={FiPlayCircle}
        label="Continue"
        href="/dashboard"
        active={path === '/dashboard'}
        {...opts}
      />
      <NavItem
        icon={FiBookOpen}
        label="Library"
        href="/dashboard/resources"
        active={path === '/dashboard/resources'}
        {...opts}
      />
      <NavItem
        icon={MdKeyboard}
        label="Keyboard"
        href="/dashboard/keyboard"
        active={path === '/dashboard/keyboard'}
        {...opts}
      />
      <NavItem
        icon={FiHelpCircle}
        label="Get Help"
        onClick={getHelp}
        {...opts}
      />
    </VStack>
  )
  const bottomNav = (opts?: NavOpts) => (
    <VStack spacing={2} align="stretch" px={2}>
      <NavItem
        icon={FiUser}
        label="Profile"
        onClick={profile.onOpen}
        avatarSrc={avatarSrc || undefined}
        {...opts}
      />
      <NavItem
        icon={FiLogOut}
        label="Log out"
        href="/api/auth/logout"
        {...opts}
      />
    </VStack>
  )

  const brandMark = (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Flex w="56px" h="60px" mx={2} justify="center" align="center">
        <Image
          src="/actingAccentsMark.png"
          alt="Acting Accents"
          w="64px"
          h="auto"
          maxW="none"
          objectFit="contain"
        />
      </Flex>
    </Link>
  )

  return (
    <>
      {/* Desktop rail (lg+). Reserves the collapsed width so content never
          shifts; the rail overlays content when it expands on hover. */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w={RAIL_COLLAPSED}
        flexShrink={0}
        alignSelf="stretch"
        minH="100vh"
        position="relative"
        bg="surface.canvas"
      >
        <Flex
          role="group"
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          w={RAIL_COLLAPSED}
          direction="column"
          justify="space-between"
          bg="surface.rail"
          pt={0}
          pb={6}
          overflow="hidden"
          zIndex={30}
          borderRightRadius="2xl"
          transition="width 0.2s ease, box-shadow 0.2s ease"
          _hover={{
            w: RAIL_EXPANDED,
            boxShadow: '8px 0 30px rgba(0,0,0,0.25)',
          }}
        >
          <Box>
            {brandMark}
            {mainNav()}
          </Box>
          {bottomNav()}
        </Flex>
      </Box>

      {/* Mobile/tablet: floating hamburger that opens the nav as a drawer. */}
      <IconButton
        aria-label="Open menu"
        icon={<FiMenu />}
        onClick={menu.onOpen}
        display={{ base: 'flex', lg: 'none' }}
        position="fixed"
        top={3}
        left={3}
        zIndex={1100}
        size="md"
        borderRadius="full"
        bg="surface.rail"
        color="white"
        boxShadow="md"
        _hover={{ bg: 'surface.rail', opacity: 0.9 }}
        _active={{ bg: 'surface.rail' }}
      />

      <Drawer
        isOpen={menu.isOpen}
        placement="left"
        onClose={menu.onClose}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent bg="surface.rail">
          <DrawerCloseButton color="white" />
          <DrawerBody px={0} py={4}>
            <Flex direction="column" h="100%" justify="space-between">
              <Box>
                {brandMark}
                {mainNav({ showLabel: true, onNavigate: menu.onClose })}
              </Box>
              {bottomNav({ showLabel: true, onNavigate: menu.onClose })}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ProfileModal isOpen={profile.isOpen} onClose={profile.onClose} />
    </>
  )
}

export default DashboardNavigationContainer
