import { useUser } from '@auth0/nextjs-auth0/client'
import { Box, Text } from '@chakra-ui/react'
import CourseContainer from './DashboardCourseContent/CourseContainer'

const DashboardPage = () => {
  const { user } = useUser()

  if (!user) {
    // Redirect or show a message if the user is not authenticated
    return <p>Please log in to access the dashboard.</p>
  }

  return (
    <Box>
      <Text>Welcome to the Dashboard, {user.name}!</Text>
      <CourseContainer />
    </Box>
  )
}

export default DashboardPage
