import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import ProgressPage from '../../components/Dashboard/Progress/ProgressPage'

const progress = () => {
  return (
    <DashboardLayout>
      <ProgressPage />
    </DashboardLayout>
  )
}

export const getServerSideProps = withPageAuthRequired()

export default progress
