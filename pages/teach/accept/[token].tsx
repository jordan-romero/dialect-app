import React from 'react'
import { useRouter } from 'next/router'
import AcceptTeacherInvite from '../../../components/Teach/AcceptTeacherInvite'

const AcceptInvitePage = () => {
  const { query } = useRouter()
  return typeof query.token === 'string' ? (
    <AcceptTeacherInvite token={query.token} />
  ) : null
}
export default AcceptInvitePage
