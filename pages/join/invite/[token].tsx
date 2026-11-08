import React from 'react'
import { useRouter } from 'next/router'
import JoinPage from '../../../components/Join/JoinPage'

const JoinByInvite = () => {
  const { query } = useRouter()
  return typeof query.token === 'string' ? <JoinPage token={query.token} /> : null
}
export default JoinByInvite
