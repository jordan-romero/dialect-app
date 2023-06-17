import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Layout from '../components/Layout/_layout'
import theme from '../components/theme'
import '../components/theme/styles.css'
import { ConfigCatProvider } from 'configcat-react'
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }: AppProps) {
  const CONFIGCAT_KEY = process.env.NEXT_PUBLIC_CONFIGCAT_SDK_KEY

  if (!CONFIGCAT_KEY) {
    return <div>Loading...</div>
  }
  return (
    <UserProvider>
    <ConfigCatProvider sdkKey={CONFIGCAT_KEY}>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </ConfigCatProvider>
    </ UserProvider>
  )
}
