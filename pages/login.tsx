import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import router from 'next/router'

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabaseClient.from('test').select('*')
        if (data) {
          setData(data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    // Only run query once user is logged in.
    if (user) {
      loadData()
    }
  }, [user])

  if (!user)
    return (
      <Auth
        redirectTo="/dashboard"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={['google', 'github']}
        socialLayout="horizontal"
      />
    )

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
    </>
  )
}

export default LoginPage
