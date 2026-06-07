import React, { ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import DashboardNavigationContainer from './DashNavigation/DashboardNavigationContainer'
import BadgeCelebrationManager from './BadgeCelebrationManager'

// Shared shell for every /dashboard/* page: keeps the side rail persistent so
// navigation is always available no matter which dashboard page you're on.
const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex align="stretch">
      <DashboardNavigationContainer />
      <Box flex="1" minW={0}>
        {children}
      </Box>
      {/* Global: pops a celebration anywhere in the dashboard when a badge is earned. */}
      <BadgeCelebrationManager />
    </Flex>
  )
}

export default DashboardLayout
