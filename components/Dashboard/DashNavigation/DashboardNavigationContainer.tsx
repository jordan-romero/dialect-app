import { Box, VStack, Spacer, Icon } from '@chakra-ui/react'
import React from 'react'
import { FaHome, FaFileAlt, FaUser } from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import { IoChatboxEllipsesSharp } from 'react-icons/io5'

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
        <Icon as={FaHome} boxSize={8} color="util.white" />
        <Icon as={FaFileAlt} boxSize={8} color="util.white" />
        <Icon as={GiProgression} boxSize={8} color="util.white" />
        <Icon as={IoChatboxEllipsesSharp} boxSize={8} color="util.white" />
      </VStack>
      <VStack spacing={6} align="center" mr="4" justify="flex-end">
        <Icon as={FaUser} boxSize={8} color="util.white" />
        <Box>Logout</Box>
      </VStack>
    </Box>
  )
}

export default DashboardNavigationContainer
