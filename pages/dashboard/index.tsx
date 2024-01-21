// pages/dashboard.js

import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import DashboardPage from '../../components/Dashboard/DashboardPage'

const Dashboard = () => {
  return <DashboardPage />
}

export const getServerSideProps = withPageAuthRequired()

export default Dashboard
