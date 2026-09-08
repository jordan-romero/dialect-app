import React, { useEffect, useState } from 'react'
import { Flex, Box, Text, Icon, IconButton } from '@chakra-ui/react'
import { FiMonitor, FiX } from 'react-icons/fi'

const DISMISS_KEY = 'aa:mobileBannerDismissed'

/**
 * A friendly, dismissible nudge shown only on small screens (mobile/tablet, i.e.
 * below the `lg` breakpoint where the full app shell kicks in). Dismissal is
 * remembered in localStorage so it never nags twice.
 */
const MobileExperienceBanner: React.FC = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(DISMISS_KEY) !== '1') setShow(true)
  }, [])

  const dismiss = () => {
    setShow(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1')
    }
  }

  if (!show) return null

  return (
    <Flex
      display={{ base: 'flex', lg: 'none' }}
      position="fixed"
      bottom={3}
      left={3}
      right={3}
      zIndex={1200}
      align="center"
      gap={3}
      px={4}
      py={3}
      borderRadius="xl"
      color="white"
      bgGradient="linear(to-r, brand.iris, #7C5CFF)"
      boxShadow="0 10px 30px rgba(0,0,0,0.3)"
    >
      <Icon as={FiMonitor} boxSize={5} flexShrink={0} />
      <Box flex="1" minW={0}>
        <Text fontSize="sm" fontWeight="bold" lineHeight="1.2">
          Best on a bigger screen
        </Text>
        <Text fontSize="xs" opacity={0.9}>
          You can explore here, but the IPA keyboard and exercises really shine
          on a laptop or desktop.
        </Text>
      </Box>
      <IconButton
        aria-label="Dismiss"
        icon={<FiX />}
        size="sm"
        variant="ghost"
        color="white"
        flexShrink={0}
        _hover={{ bg: 'whiteAlpha.300' }}
        onClick={dismiss}
      />
    </Flex>
  )
}

export default MobileExperienceBanner
