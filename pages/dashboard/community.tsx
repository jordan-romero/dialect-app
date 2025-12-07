import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import CommunityPage from '../../components/Dashboard/Community/CommunityPage'

const community = () => {
  return <CommunityPage />
}

export const getServerSideProps = withPageAuthRequired()

export default community
