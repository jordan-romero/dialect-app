import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import CommunityPage from '../../components/Dashboard/Community/CommunityPage'

const community = () => {
  return (
    <DashboardLayout>
      <CommunityPage />
    </DashboardLayout>
  )
}

export const getServerSideProps = withPageAuthRequired()

export default community
