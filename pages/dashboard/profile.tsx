import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import ProfilePage from '../../components/Dashboard/Profile/ProfilePage'

const profile = () => {
  return (
    <DashboardLayout>
      <ProfilePage />
    </DashboardLayout>
  )
}

export const getServerSideProps = withPageAuthRequired()

export default profile
