import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Layout from '../components/Layout/_layout'
import theme from '../components/theme'
import '../components/theme/styles.css'
import { ConfigCatProvider } from 'configcat-react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  const CONFIGCAT_KEY = process.env.NEXT_PUBLIC_CONFIGCAT_SDK_KEY

  const [supabaseClient] = useState(() => createPagesBrowserClient())

  if (!CONFIGCAT_KEY) {
    return <div>Loading...</div>
  }
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ConfigCatProvider sdkKey={CONFIGCAT_KEY}>
        <ChakraProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </ConfigCatProvider>
    </SessionContextProvider>
  )
}
