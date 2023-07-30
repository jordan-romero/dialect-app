import React, { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Box } from '@chakra-ui/react'

const DashboardPage = () => {
  const user = useUser()
  console.log(user?.user?.email, '***JORDAN*** user')

  return <Box>Welcome {user?.user?.email}!</Box>
}

export default DashboardPage
