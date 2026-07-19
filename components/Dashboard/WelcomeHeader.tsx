import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Flex, Text } from '@chakra-ui/react'
import { useUser } from '@auth0/nextjs-auth0/client'
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

// Large greeting shown at the top of the Dashboard overview.
const WelcomeHeader: React.FC = () => {
  const { user } = useUser()
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
    <Flex align="center" gap={4} mb={8}>
      <Avatar
        size="lg"
        name={name}
        src={avatarSrc || user?.picture || undefined}
        bg="brand.iris"
        color="white"
      />
      <Text fontSize="2xl" fontWeight="bold" lineHeight="1.2">
        Welcome back, {name} 👋
      </Text>
    </Flex>
  )
}

export default WelcomeHeader
