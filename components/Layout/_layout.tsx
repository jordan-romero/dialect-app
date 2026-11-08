import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Navbar from './Navbar'
import Footer from './Footer'
import { MotionConfig } from 'framer-motion'
import { ScrollProgress } from '../PrelaunchHomePage/motion'
import { isAppShellPath } from './appShell'

interface Props {
  children?: ReactNode
  // any props that come into the component
}

// Marketing pages lock to a common large-desktop width (don't stretch on huge
// monitors). The dashboard is an app shell, so it fills the whole viewport.
const MAX_APP_WIDTH = '1600px'

const Layout = ({ children }: Props) => {
  const router = useRouter()
  const isDashboard = isAppShellPath(router.pathname)

  return (
    <MotionConfig reducedMotion="user">
      {!isDashboard && <ScrollProgress />}
      <Box
        w="100%"
        maxW={isDashboard ? '100%' : MAX_APP_WIDTH}
        h="auto"
        mr="auto"
        ml="auto"
        px={isDashboard ? 0 : { base: 4, md: 6, lg: 8 }}
      >
        <Navbar />
        {children}
        <Footer />
      </Box>
    </MotionConfig>
  )
}

export default Layout
