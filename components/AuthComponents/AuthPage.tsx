import React from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(`${SUPABASE_URL}`, `${SUPABASE_KEY}`)

const AuthPage = () => {
  return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
}

export default AuthPage
