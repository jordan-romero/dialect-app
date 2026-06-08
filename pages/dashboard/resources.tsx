import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import ResourcesContainer from '../../components/Dashboard/Resources/ResourcesContainer'

const resources = () => {
  return (
    <DashboardLayout>
      <ResourcesContainer />
    </DashboardLayout>
  )
}

export const getServerSideProps = withPageAuthRequired()

export default resources
