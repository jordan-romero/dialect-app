import React from 'react'
import { useRouter } from 'next/router'
import JoinPage from '../../components/Join/JoinPage'

const JoinByCode = () => {
  const { query } = useRouter()
  return typeof query.code === 'string' ? <JoinPage code={query.code} /> : null
}
export default JoinByCode
