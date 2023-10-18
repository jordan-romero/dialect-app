import Head from 'next/head'
import PrelaunchHomePage from '../components/PrelaunchHomePage/PrelaunchHomePage'

export default function Home() {
  return (
    <>
      <Head>
        <title>ActingAccents.com</title>
        <meta
          name="description"
          content="An online course to help you learn any dialect!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="ActingAccents.com" />
        <meta
          property="og:description"
          content="An online course to help you learn any dialect!"
        />
        <meta property="og:image" content="/actingAccentsLogo.jpg" />
        <meta property="og:image:alt" content="Preview of ActingAccents.com" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.actingaccents.com" />
      </Head>
      <main>
        <PrelaunchHomePage />
      </main>
    </>
  )
}
