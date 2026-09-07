import React, { ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import DashboardNavigationContainer from './DashNavigation/DashboardNavigationContainer'
import BadgeCelebrationManager from './BadgeCelebrationManager'
import MobileExperienceBanner from './MobileExperienceBanner'
import UserScopeGuard from './UserScopeGuard'
import { IpaKeyboardProvider } from '../Community/IpaKeyboardPip'

// Shared shell for every /dashboard/* page: keeps the side rail persistent so
// navigation is always available no matter which dashboard page you're on.
const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <IpaKeyboardProvider>
      <UserScopeGuard />
      <Flex
        align="stretch"
        bg="surface.canvas"
        color="text.primary"
        minH="100vh"
      >
        <DashboardNavigationContainer />
        <Box flex="1" minW={0}>
          {children}
        </Box>
        {/* Global: pops a celebration anywhere in the dashboard when a badge is earned. */}
        <BadgeCelebrationManager />
        {/* Mobile/tablet-only nudge that the experience is best on desktop. */}
        <MobileExperienceBanner />
      </Flex>
    </IpaKeyboardProvider>
  )
}

export default DashboardLayout
