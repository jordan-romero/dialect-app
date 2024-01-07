import { Box, VStack, Icon } from '@chakra-ui/react'
import React from 'react'
import { FaHome, FaFileAlt, FaUser } from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import { IoChatboxEllipsesSharp } from 'react-icons/io5'
import Link from 'next/link'
import Logout from '../../AuthComponents/Logout'

const DashboardNavigationContainer = () => {
  return (
    <Box bg="brand.purple" color="util.white" p={4} mr="-4" height={700}>
      <VStack
        spacing={8}
        align="center"
        mr="4"
        justify="flex-start"
        height="88%"
      >
        <Link href="/">
          <Icon as={FaHome} boxSize={8} color="util.white" />
        </Link>
        <Link href="/dashboard/resources">
          <Icon as={FaFileAlt} boxSize={8} color="util.white" />
        </Link>
        <Link href="/dashboard/progress">
          <Icon as={GiProgression} boxSize={8} color="util.white" />
        </Link>
        <Link href="/dashboard/community">
          <Icon as={IoChatboxEllipsesSharp} boxSize={8} color="util.white" />
        </Link>
      </VStack>
      <VStack spacing={6} align="center" mr="4" justify="flex-end">
        <Link href="/dashboard/profile">
          <Icon as={FaUser} boxSize={8} color="util.white" />
        </Link>
        <Logout />
      </VStack>
    </Box>
  )
}

export default DashboardNavigationContainer
