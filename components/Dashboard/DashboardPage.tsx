import React, { useEffect } from 'react'
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client'
import { Box } from '@chakra-ui/react'
import CourseContainer from './Course/CourseContainer'
import DashboardLayout from './DashboardLayout'

const DashboardPage = () => {
  // TODO clean this up and pull it out into a separate file
  const currentUser = useUser()
  useEffect(() => {
    const createUserInDatabase = async (user: UserProfile) => {
      try {
        const response = await fetch('/api/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user }),
        })

        if (response.ok) {
          return await response.json()
        } else {
          const errorData = await response.json()
          console.error('Failed to create/update user:', errorData)
          throw new Error(errorData.error || 'Failed to create user')
        }
      } catch (error) {
        // Only log error, don't throw to prevent app from breaking
        console.error('Error in createUserInDatabase:', error)
        return null
      }
    }

    if (currentUser && currentUser.user && currentUser.user.email) {
      createUserInDatabase(currentUser.user).catch((error) => {
        console.error('Error creating user:', error)
      })
    }
  }, [currentUser])

  return (
    <DashboardLayout>
      <Box h="100vh">
        <CourseContainer />
      </Box>
    </DashboardLayout>
  )
}

export default DashboardPage
