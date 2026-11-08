import React from 'react'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import TeachHome from '../../components/Teach/TeachHome'
import { requirePermissionPage } from '../../lib/pageGuards'

const TeachIndex = () => (
  <DashboardLayout>
    <TeachHome />
  </DashboardLayout>
)

export const getServerSideProps = requirePermissionPage('cohort:manage')
export default TeachIndex
