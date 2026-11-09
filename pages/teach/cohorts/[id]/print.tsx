// Printable class sign-up sheet: big QR code, join code, short instructions.
// Laid out for US Letter; the toolbar hides when printing.
import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import QrCode from '../../../../components/Teach/QrCode'
import { teacherName, useJson } from '../../../../components/Teach/util'
import { requirePermissionPage } from '../../../../lib/pageGuards'

type Resp = {
  cohort: {
    name: string
    institution: string | null
    joinCode: string
    joinEnabled: boolean
    joinUrl: string
    teacher: {
      firstName: string | null
      lastName: string | null
      email: string
    } | null
  }
}

const PrintPage = () => {
  const { query } = useRouter()
  const id = typeof query.id === 'string' ? query.id : null
  const { data, error } = useJson<Resp>(id ? `/api/teach/cohorts/${id}` : null)
  if (error) return <Text p={8}>{error}</Text>
  if (!data) return null
  const c = data.cohort
  const host = c.joinUrl.replace(/^https?:\/\//, '').replace(/\/join\/.*$/, '')
  return (
    <Box bg="white" color="gray.900" minH="100vh">
      <Head>
        <title>{`${c.name}: join code`}</title>
        <style>{`@page { size: letter; margin: 0.6in } @media print { .no-print { display: none !important } }`}</style>
      </Head>
      <HStack
        className="no-print"
        p={4}
        justify="center"
        borderBottomWidth="1px"
      >
        <Button colorScheme="purple" onClick={() => window.print()}>
          Print
        </Button>
        {!c.joinEnabled && (
          <Text color="red.600">
            Joining is turned off for this class, so this code won’t work.
          </Text>
        )}
      </HStack>
      <Center py={10}>
        <Stack align="center" spacing={6} textAlign="center" maxW="7in">
          <Text
            fontSize="lg"
            letterSpacing="widest"
            textTransform="uppercase"
            color="purple.700"
            fontWeight="bold"
          >
            Acting Accents
          </Text>
          <Box>
            <Heading size="2xl">{c.name}</Heading>
            <Text fontSize="xl" mt={2} color="gray.600">
              {[c.institution, teacherName(c.teacher)]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </Box>
          <QrCode url={c.joinUrl} size={340} />
          <Box>
            <Text fontSize="lg" color="gray.600">
              Class code
            </Text>
            <Text
              fontSize="6xl"
              fontWeight="bold"
              fontFamily="mono"
              letterSpacing="0.15em"
              lineHeight="1"
            >
              {c.joinCode}
            </Text>
          </Box>
          <Stack spacing={1} fontSize="lg">
            <Text>
              1. Scan the QR code with your phone camera, or go to{' '}
              <b>{host}/join</b> and type the code.
            </Text>
            <Text>
              2. Sign up or log in, then press <b>Join class</b>.
            </Text>
          </Stack>
          <Text fontSize="sm" color="gray.500" maxW="5.5in">
            Your teacher will be able to see your progress and the answers you
            enter in the course.
          </Text>
        </Stack>
      </Center>
    </Box>
  )
}

export const getServerSideProps = requirePermissionPage('cohort:manage')
export default PrintPage
