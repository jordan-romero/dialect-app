import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

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
        redirectTo="http://localhost:3000/dashboard"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={['google', 'github']}
        socialLayout="horizontal"
      />
    )

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>client-side data fetching with RLS</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default LoginPage
