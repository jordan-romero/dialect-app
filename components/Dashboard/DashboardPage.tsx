import React, { useEffect } from 'react'
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client'
import { Box, Flex } from '@chakra-ui/react'
import CourseContainer from './Course/CourseContainer'
import DashboardNavigationContainer from './DashNavigation/DashboardNavigationContainer'

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
          const data = await response.json()
          // Handle both new user creation (201) and existing user (200)
          if (response.status === 200) {
            console.log('User already exists:', data.message)
          } else if (response.status === 201) {
            console.log('New user created:', data.message)
          }
          return data
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
      createUserInDatabase(currentUser.user)
        .then((response) => {
          if (response) {
            console.log(
              `User with email ${currentUser?.user?.email} is logged in.`,
            )
          }
        })
        .catch((error) => {
          console.error('Error creating user:', error)
        })
    }
  }, [currentUser])

  return (
    <Box>
      Welcome {currentUser?.user?.email}!
      <Flex>
        <DashboardNavigationContainer />
        <CourseContainer />
      </Flex>
      <Flex></Flex>
    </Box>
  )
}

export default DashboardPage
