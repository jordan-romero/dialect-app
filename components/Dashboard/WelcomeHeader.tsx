import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Flex, Spacer, Text } from '@chakra-ui/react'
import type { UserProfile } from '@auth0/nextjs-auth0/client'

const firstNameFrom = (user?: UserProfile | null): string => {
  const raw =
    (user?.given_name as string) ||
    (user?.nickname as string) ||
    user?.name ||
    user?.email ||
    ''
  if (!raw) return 'there'
  // Take the local part of an email, then strip any +tag, then the first token.
  let base = raw.includes('@') ? raw.split('@')[0] : raw
  base = base.split('+')[0]
  const first = base.split(/[\s._]/)[0]
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there'
}

// Slim top bar above the dashboard. Compact so it doesn't crowd the lesson;
// the right side is left open for quick stats/actions later.
const WelcomeHeader: React.FC<{ user?: UserProfile | null }> = ({ user }) => {
  const name = firstNameFrom(user)
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

  return (
    <Flex
      align="center"
      gap={3}
      px={{ base: 4, md: 6 }}
      h="60px"
      flexShrink={0}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Avatar
        size="sm"
        name={name}
        src={avatarSrc || user?.picture || undefined}
        bg="brand.iris"
        color="white"
      />
      <Text fontWeight="semibold" fontSize="md">
        Welcome back, {name} 👋
      </Text>
      <Spacer />
    </Flex>
  )
}

export default WelcomeHeader
