import React, { useEffect } from 'react'
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client'
import { Box } from '@chakra-ui/react'
import CourseContainer from './Course/CourseContainer'

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
          console.log(response) // Log the response from the user creation API call
        })
        .catch((error) => {
          console.error('Error creating user:', error)
        })
    }
  }, [currentUser])

  return (
    <Box>
      Welcome {currentUser?.user?.email}!
      <CourseContainer />
    </Box>
  )
}

export default DashboardPage
