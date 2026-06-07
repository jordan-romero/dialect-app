import { Box, VStack, Icon, Text, Flex } from '@chakra-ui/react'
import React from 'react'
import {
  FiPlayCircle,
  FiBookOpen,
  FiGrid,
  FiHelpCircle,
  FiUser,
  FiLogOut,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import Link from 'next/link'
import { useRouter } from 'next/router'

const HELP_EMAIL = 'info@actingaccents.com'
const RAIL_COLLAPSED = '72px'
const RAIL_EXPANDED = '210px'

interface NavItemProps {
  icon: IconType
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

// A single rail row: icon stays put; the label is revealed when the rail
// expands on hover (label is clipped while collapsed).
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  onClick,
  active,
}) => {
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
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Text
        fontSize="sm"
        fontWeight="medium"
        whiteSpace="nowrap"
        opacity={0}
        transition="opacity 0.15s ease"
        _groupHover={{ opacity: 1 }}
      >
        {label}
      </Text>
    </Flex>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
        {row}
      </Link>
    )
  }
  return (
    <Box as="button" onClick={onClick} aria-label={label} w="100%">
      {row}
    </Box>
  )
}

const DashboardNavigationContainer = () => {
  const router = useRouter()
  const path = router.pathname

  const getHelp = () => {
    const subject = encodeURIComponent('Help with Acting Accents')
    const body = encodeURIComponent(
      'Hi, I could use some help with the following:\n\n(What are you stuck on?)\n\n— Sent from the Acting Accents dashboard',
    )
    window.open(`mailto:${HELP_EMAIL}?subject=${subject}&body=${body}`)
  }

  return (
    // Outer box reserves the collapsed width so content never shifts; the rail
    // itself overlays the content when it expands on hover. It stretches to the
    // full dashboard height (at least the viewport).
    <Box
      w={RAIL_COLLAPSED}
      flexShrink={0}
      alignSelf="stretch"
      minH="100vh"
      position="relative"
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
        bg="brand.purple"
        py={6}
        overflow="hidden"
        zIndex={30}
        borderRightRadius="2xl"
        transition="width 0.2s ease, box-shadow 0.2s ease"
        _hover={{ w: RAIL_EXPANDED, boxShadow: '8px 0 30px rgba(0,0,0,0.25)' }}
      >
        <VStack spacing={2} align="stretch" px={2}>
          <NavItem
            icon={FiPlayCircle}
            label="Continue"
            href="/dashboard"
            active={path === '/dashboard'}
          />
          <NavItem
            icon={FiBookOpen}
            label="Library"
            href="/dashboard/resources"
            active={path === '/dashboard/resources'}
          />
          <NavItem
            icon={FiGrid}
            label="Dashboard"
            href="/dashboard/progress"
            active={path === '/dashboard/progress'}
          />
          <NavItem icon={FiHelpCircle} label="Get Help" onClick={getHelp} />
        </VStack>

        <VStack spacing={2} align="stretch" px={2}>
          <NavItem
            icon={FiUser}
            label="Profile"
            href="/dashboard/profile"
            active={path === '/dashboard/profile'}
          />
          <NavItem icon={FiLogOut} label="Log out" href="/api/auth/logout" />
        </VStack>
      </Flex>
    </Box>
  )
}

export default DashboardNavigationContainer
