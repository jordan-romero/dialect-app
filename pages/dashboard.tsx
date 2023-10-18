import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardPage from '../components/DashboardPage/DashboardPage'

const dashboard = () => {
  return <DashboardPage />
}

export default dashboard
