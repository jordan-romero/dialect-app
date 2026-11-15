import React from 'react'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import AdminHome from '../../components/Admin/AdminHome'
import { requirePermissionPage } from '../../lib/pageGuards'

const AdminIndex = () => (
  <DashboardLayout>
    <AdminHome />
  </DashboardLayout>
)

export const getServerSideProps = requirePermissionPage('teacher:invite')
export default AdminIndex
