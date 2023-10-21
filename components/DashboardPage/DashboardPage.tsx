import { Box, Text } from '@chakra-ui/react'
import CourseContainer from './DashboardCourseContent/CourseContainer'
import { useUser } from '@supabase/auth-helpers-react'

const DashboardPage = () => {
  const user = useUser()

  if (!user) {
    return <p>Please log in to access the dashboard.</p>
  }

  return (
    <Box>
      <Text>Welcome to the Dashboard, {user.email}!</Text>
      <CourseContainer />
    </Box>
  )
}

export default DashboardPage
