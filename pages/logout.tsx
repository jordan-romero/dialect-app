import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Logout = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [])

  return null
}

export default Logout
