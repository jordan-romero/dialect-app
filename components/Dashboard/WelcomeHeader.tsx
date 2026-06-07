import React from 'react'
import { Avatar, Box, Flex, Text } from '@chakra-ui/react'
import type { UserProfile } from '@auth0/nextjs-auth0/client'

const firstNameFrom = (user?: UserProfile | null): string => {
  const raw =
    (user?.given_name as string) ||
    (user?.nickname as string) ||
    user?.name ||
    user?.email ||
    ''
  if (!raw) return 'there'
  // Use the email local part if that's all we have, stripping any +tag.
  const base = raw.includes('@') ? raw.split('@')[0].split('+')[0] : raw
  const first = base.split(/[\s._]/)[0]
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there'
}

const WelcomeHeader: React.FC<{ user?: UserProfile | null }> = ({ user }) => {
  const name = firstNameFrom(user)

  return (
    <Flex align="center" gap={4} px={{ base: 4, md: 6 }} py={5} mb={2}>
      <Avatar
        size="md"
        name={name}
        src={user?.picture || undefined}
        bg="brand.iris"
        color="white"
      />
      <Box>
        <Text fontSize="2xl" fontWeight="bold" lineHeight="1.2">
          Welcome back, {name} 👋
        </Text>
        <Text color="gray.500" fontSize="sm">
          Let&apos;s pick up where you left off.
        </Text>
      </Box>
    </Flex>
  )
}

export default WelcomeHeader
