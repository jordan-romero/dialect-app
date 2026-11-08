// Student side of joining a class: by code (typed, or from a link / QR code)
// or by an emailed invite link. Signed-out visitors sign up or log in first and
// come back here; joining is always an explicit click, under a note that the
// teacher will see their progress and answers.
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Input,
  Link,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'

type Preview = {
  name: string
  institution: string | null
  teacherName: string | null
  paymentMode: 'SELF_PAY' | 'SEATS'
  open: boolean
  endsAt: string | null
  inviteEmail: string | null
}
type Joined = { cohortId: number; cohortName: string; alreadyMember: boolean; usesSeat: boolean; needsPurchase: boolean }

const Shell = ({ children }: { children: React.ReactNode }) => (
  <Center minH="100vh" bg="gray.50" px={4} py={10}>
    <Box bg="white" color="gray.800" borderRadius="xl" boxShadow="md" p={{ base: 6, md: 10 }} w="100%" maxW="520px">
      <Text fontSize="sm" letterSpacing="widest" textTransform="uppercase" color="brand.purple" fontWeight="bold" mb={4}>
        Acting Accents
      </Text>
      {children}
    </Box>
  </Center>
)

export const EnterCode = () => {
  const router = useRouter()
  const [code, setCode] = useState('')
  return (
    <Shell>
      <Heading size="lg">Join your class</Heading>
      <Text mt={2} color="gray.600">
        Type the class code your teacher gave you.
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const c = code.toUpperCase().replace(/[^0-9A-Z]/g, '')
          if (c) router.push(`/join/${c}`)
        }}
      >
        <HStack mt={6}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ABC-123"
            size="lg"
            fontFamily="mono"
            textTransform="uppercase"
            letterSpacing="wider"
            autoFocus
            aria-label="Class code"
          />
          <Button type="submit" colorScheme="purple" size="lg" isDisabled={!code.trim()}>
            Next
          </Button>
        </HStack>
      </form>
    </Shell>
  )
}

const JoinPage = ({ code, token }: { code?: string; token?: string }) => {
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState<Joined | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)

  const qs = token ? `token=${encodeURIComponent(token)}` : `code=${encodeURIComponent(code || '')}`
  const here = router.asPath.split('?')[0]

  useEffect(() => {
    fetch(`/api/join?${qs}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (r.ok) setPreview(j)
        else setPreviewError(j.error || 'That class link is not valid.')
      })
      .catch(() => setPreviewError('Network error'))
  }, [qs])

  const join = async () => {
    setJoining(true)
    setError(null)
    const r = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token ? { token } : { code }),
    })
    const j = await r.json().catch(() => ({}))
    setJoining(false)
    if (!r.ok) setError(j.error || 'Could not join the class.')
    else setJoined(j)
  }

  const buy = async () => {
    if (!joined) return
    setBuying(true)
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: joined.cohortId, returnTo: '/dashboard/progress' }),
    })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.url) window.location.href = j.url
    else {
      setError(j.message || 'Checkout is unavailable right now.')
      setBuying(false)
    }
  }

  if (previewError) {
    return (
      <Shell>
        <Heading size="md">This link doesn’t work</Heading>
        <Text mt={2} color="gray.600">
          {previewError} Check with your teacher, or{' '}
          <Link as={NextLink} href="/join" color="brand.iris">
            type a class code
          </Link>
          .
        </Text>
      </Shell>
    )
  }
  if (!preview || userLoading) {
    return (
      <Shell>
        <Spinner color="brand.purple" />
      </Shell>
    )
  }

  const login = (signup: boolean) =>
    `/api/auth/login?returnTo=${encodeURIComponent(here)}${signup ? '&screen_hint=signup' : ''}`

  return (
    <Shell>
      <Text color="gray.500" fontSize="sm">
        You’re invited to join
      </Text>
      <Heading size="lg" mt={1}>
        {preview.name}
      </Heading>
      <Text color="gray.600" mt={1}>
        {[preview.institution, preview.teacherName && `with ${preview.teacherName}`].filter(Boolean).join(' · ')}
      </Text>

      {!preview.open ? (
        <Alert status="warning" mt={6} borderRadius="md">
          <AlertIcon />
          This class is no longer open.
        </Alert>
      ) : joined ? (
        <Stack mt={6} spacing={4}>
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            {joined.alreadyMember ? 'You’re already in this class.' : 'You’ve joined the class.'}
          </Alert>
          {joined.needsPurchase ? (
            <>
              <Text>Your class uses the full course. Unlock it to keep going past the free lessons.</Text>
              <Button colorScheme="purple" size="lg" onClick={buy} isLoading={buying}>
                Unlock the full course
              </Button>
              <Button as={NextLink} href="/dashboard/progress" variant="ghost">
                Start with the free lessons
              </Button>
            </>
          ) : (
            <>
              {joined.usesSeat && <Text>Your class has given you full course access.</Text>}
              <Button as={NextLink} href="/dashboard" colorScheme="purple" size="lg">
                Start learning
              </Button>
            </>
          )}
        </Stack>
      ) : !user ? (
        <Stack mt={6} spacing={3}>
          {preview.inviteEmail && (
            <Text fontSize="sm" color="gray.600">
              This invite is for <b>{preview.inviteEmail}</b>. Use that email address.
            </Text>
          )}
          <Button as="a" href={login(true)} colorScheme="purple" size="lg">
            Sign up to join
          </Button>
          <Button as="a" href={login(false)} variant="outline" size="lg">
            I already have an account
          </Button>
        </Stack>
      ) : (
        <Stack mt={6} spacing={4}>
          <Text fontSize="sm" color="gray.600">
            Signed in as <b>{user.email}</b>.{' '}
            {preview.paymentMode === 'SEATS'
              ? 'Your class covers your course access.'
              : 'Students in this class buy the course themselves.'}
          </Text>
          <Box bg="purple.50" borderRadius="md" p={3} fontSize="sm">
            Your teacher will be able to see your progress and the answers you enter in the course, including work
            you did before joining. You can leave the class at any time.
          </Box>
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Button colorScheme="purple" size="lg" onClick={join} isLoading={joining}>
            Join class
          </Button>
          <Link href="/api/auth/logout" fontSize="sm" color="gray.500" textAlign="center">
            Not you? Log out
          </Link>
        </Stack>
      )}
    </Shell>
  )
}

export default JoinPage
