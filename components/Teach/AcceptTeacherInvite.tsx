// A teacher accepts their invite (sent once the school paid for the seats).
// Accepting makes them a teacher and creates their class with the seats.
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import {
  Alert,
  AlertIcon,
  Button,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Shell } from '../Join/JoinPage'
import { shortDate } from './util'

type Preview = {
  email: string
  teacherName: string | null
  institution: string | null
  className: string
  seats: number
  endsAt: string
  status: 'INVOICED' | 'PAID' | 'ACCEPTED' | 'VOID'
  cohortId: number | null
}

const AcceptTeacherInvite = ({ token }: { token: string }) => {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [p, setP] = useState<Preview | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/teach/accept?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (r.ok) setP(j)
        else setLoadError(j.error || 'This invite link is not valid.')
      })
      .catch(() => setLoadError('Network error'))
  }, [token])

  const accept = async () => {
    setSaving(true)
    setError(null)
    const r = await fetch('/api/teach/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      setError(j.error || 'Could not accept the invite.')
      setSaving(false)
      return
    }
    // Full load so the nav picks up the new Teach item.
    window.location.href = `/teach/cohorts/${j.cohortId}`
  }

  if (loadError)
    return (
      <Shell>
        <Heading size="md">This link doesn’t work</Heading>
        <Text mt={2} color="gray.600">
          {loadError} Reply to the email you got, or write to
          info@actingaccents.com.
        </Text>
      </Shell>
    )
  if (!p || isLoading)
    return (
      <Shell>
        <Spinner color="brand.purple" />
      </Shell>
    )

  const here = router.asPath.split('?')[0]
  const login = (signup: boolean) =>
    `/api/auth/login?returnTo=${encodeURIComponent(here)}${
      signup ? '&screen_hint=signup' : ''
    }`

  return (
    <Shell>
      <Text color="gray.500" fontSize="sm">
        You’re invited to teach
      </Text>
      <Heading size="lg" mt={1}>
        {p.className}
      </Heading>
      <Text color="gray.600" mt={1}>
        {[
          p.institution,
          `${p.seats} student seat${p.seats === 1 ? '' : 's'}`,
          `until ${shortDate(p.endsAt)}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>

      {p.status === 'VOID' ? (
        <Alert status="warning" mt={6} borderRadius="md">
          <AlertIcon />
          This invite was cancelled.
        </Alert>
      ) : p.status === 'INVOICED' ? (
        <Alert status="info" mt={6} borderRadius="md">
          <AlertIcon />
          This class is waiting for payment. You’ll get an email as soon as it’s
          paid.
        </Alert>
      ) : !user ? (
        <Stack mt={6} spacing={3}>
          <Text fontSize="sm" color="gray.600">
            Use <b>{p.email}</b> to sign up or log in.
          </Text>
          <Button as="a" href={login(true)} colorScheme="purple" size="lg">
            Create my account
          </Button>
          <Button as="a" href={login(false)} variant="outline" size="lg">
            I already have an account
          </Button>
        </Stack>
      ) : p.status === 'ACCEPTED' ? (
        <Stack mt={6} spacing={3}>
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            This invite has been accepted.
          </Alert>
          <Button as={NextLink} href="/teach" colorScheme="purple" size="lg">
            Go to my classes
          </Button>
        </Stack>
      ) : (
        <Stack mt={6} spacing={4}>
          <Text fontSize="sm" color="gray.600">
            Signed in as <b>{user.email}</b>.
          </Text>
          <Text>
            Accepting sets up your class and gives you the code your students
            use to join. You’ll also get full access to the course yourself.
          </Text>
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Button
            colorScheme="purple"
            size="lg"
            onClick={accept}
            isLoading={saving}
          >
            Accept and set up my class
          </Button>
          <Link
            href="/api/auth/logout"
            fontSize="sm"
            color="gray.500"
            textAlign="center"
          >
            Not you? Log out
          </Link>
        </Stack>
      )}
    </Shell>
  )
}

export default AcceptTeacherInvite
