import React from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../../components/Dashboard/DashboardLayout'
import StudentWork from '../../../../../components/Teach/StudentWork'
import { requirePermissionPage } from '../../../../../lib/pageGuards'

const StudentRoute = () => {
  const { query } = useRouter()
  return (
    <DashboardLayout>
      {typeof query.id === 'string' && typeof query.studentId === 'string' && (
        <StudentWork cohortId={query.id} studentId={query.studentId} />
      )}
    </DashboardLayout>
  )
}

export const getServerSideProps = requirePermissionPage('cohort:manage')
export default StudentRoute
