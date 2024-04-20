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
          return response.json()
        } else {
          throw new Error('Failed to create user')
        }
      } catch (error) {
        throw error
      }
    }

    if (currentUser && currentUser.user && currentUser.user.email) {
      createUserInDatabase(currentUser.user)
        .then((response) => {
          console.log(
            `User with email ${currentUser?.user?.email} is logged in.`,
          )
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
