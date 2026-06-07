import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import DashboardOverview from '../../components/Dashboard/Overview/DashboardOverview'

const progress = () => {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}

export const getServerSideProps = withPageAuthRequired()

export default progress
