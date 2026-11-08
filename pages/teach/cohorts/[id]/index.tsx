import React from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout'
import CohortPage from '../../../../components/Teach/CohortPage'
import { requirePermissionPage } from '../../../../lib/pageGuards'

const CohortRoute = () => {
  const { query } = useRouter()
  return <DashboardLayout>{typeof query.id === 'string' && <CohortPage id={query.id} />}</DashboardLayout>
}

export const getServerSideProps = requirePermissionPage('cohort:manage')
export default CohortRoute
