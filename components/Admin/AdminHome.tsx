// Admin home (Scott, Krista): sell seat packages to teachers, and set roles.
//
// Invite a teacher with N seats → Stripe invoices the billing contact → once
// paid (in Stripe, or marked paid here) the teacher gets an accept link →
// accepting creates their class with a student join code.
import React, { useMemo, useState } from 'react'
import NextLink from 'next/link'
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Link,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { FiCopy, FiExternalLink, FiMail } from 'react-icons/fi'
import { money, send, shortDate, useJson } from '../Teach/util'

type Status = 'INVOICED' | 'PAID' | 'ACCEPTED' | 'VOID'
type Invite = {
  id: number
  email: string
  teacherName: string | null
  institution: string | null
  className: string
  seats: number
  unitAmount: number
  total: number
  billingEmail: string
  endsAt: string
  status: Status
  invoiceUrl: string | null
  paidAt: string | null
  paidManually: boolean
  emailedAt: string | null
  emailError: string | null
  acceptedAt: string | null
  cohortId: number | null
  joinCode: string | null
  acceptUrl: string | null
  createdBy: string | null
  createdAt: string
}
type Tier = { minSeats: number; unitAmount: number; label: string }
type Resp = { invites: Invite[]; seatTiers: Tier[] }

const STATUS: Record<Status, { label: string; color: string }> = {
  INVOICED: { label: 'Waiting for payment', color: 'orange' },
  PAID: { label: 'Paid · teacher invited', color: 'blue' },
  ACCEPTED: { label: 'Class set up', color: 'green' },
  VOID: { label: 'Cancelled', color: 'gray' },
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <Box
    bg="surface.card"
    borderWidth="1px"
    borderColor="border.subtle"
    borderRadius="xl"
    p={{ base: 4, md: 6 }}
  >
    {children}
  </Box>
)

const AdminHome = () => {
  const { data, loading, error, reload } = useJson<Resp>(
    '/api/admin/teacher-invites',
  )
  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <Heading size="lg">Admin</Heading>
      <Text color="text.muted" mt={1} mb={6}>
        Sell class seats to teachers. The teacher gets their class and student
        join code once the invoice is paid.
      </Text>
      <Stack spacing={6}>
        <InviteForm tiers={data?.seatTiers || []} onCreated={reload} />
        <Card>
          <Heading size="md" mb={4}>
            Teacher invites
          </Heading>
          {error ? (
            <Text color="red.500">{error}</Text>
          ) : loading && !data ? (
            <Skeleton h="120px" />
          ) : (
            <InviteTable invites={data?.invites || []} onChange={reload} />
          )}
        </Card>
        <RoleCard />
      </Stack>
    </Box>
  )
}

const tierPrice = (tiers: Tier[], seats: number) => {
  let t = tiers[0]
  for (const x of tiers) if (seats >= x.minSeats) t = x
  return t?.unitAmount ?? 15000
}

const defaultEnd = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 5)
  return d.toISOString().slice(0, 10)
}

const InviteForm = ({
  tiers,
  onCreated,
}: {
  tiers: Tier[]
  onCreated: () => void
}) => {
  const toast = useToast()
  const blank = {
    email: '',
    teacherName: '',
    institution: '',
    className: '',
    seats: '20',
    billingEmail: '',
    endsAt: defaultEnd(),
  }
  const [f, setF] = useState(blank)
  // null = follow the tier price; a string = the admin typed a custom price.
  const [price, setPrice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const seats = Math.max(0, Math.floor(Number(f.seats) || 0))
  const unitCents =
    price === null
      ? tierPrice(tiers, seats || 1)
      : Math.round(Number(price) * 100)
  const total = seats * (Number.isFinite(unitCents) ? unitCents : 0)
  const set =
    (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setF({ ...f, [k]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !window.confirm(
        `Send a ${money(total)} invoice to ${
          f.billingEmail.trim() || f.email.trim()
        } for ${seats} seats?`,
      )
    )
      return
    setSaving(true)
    const r = await send('/api/admin/teacher-invites', 'POST', {
      ...f,
      seats,
      unitAmount: unitCents,
      endsAt: new Date(`${f.endsAt}T23:59:59`).toISOString(),
    })
    setSaving(false)
    if (!r.ok) {
      toast({
        title: r.data.error || 'Could not send the invoice',
        status: 'error',
      })
      return
    }
    toast({
      title: 'Invoice sent',
      description: 'The teacher is invited as soon as it’s paid.',
      status: 'success',
    })
    setF(blank)
    setPrice(null)
    onCreated()
  }

  return (
    <Card>
      <Heading size="md" mb={1}>
        Invite a teacher
      </Heading>
      <Text fontSize="sm" color="text.muted" mb={5}>
        Stripe emails an invoice (card or bank transfer, due in 30 days). Their
        class and join code are created after payment.
      </Text>
      <form onSubmit={submit}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Teacher email</FormLabel>
            <Input type="email" value={f.email} onChange={set('email')} />
            <FormHelperText>They sign in with this address.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Teacher name</FormLabel>
            <Input value={f.teacherName} onChange={set('teacherName')} />
          </FormControl>
          <FormControl>
            <FormLabel>School or university</FormLabel>
            <Input value={f.institution} onChange={set('institution')} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Class name</FormLabel>
            <Input
              value={f.className}
              onChange={set('className')}
              placeholder="Voice & Speech II, Spring 2027"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Seats</FormLabel>
            <Input
              type="number"
              min={1}
              max={500}
              value={f.seats}
              onChange={set('seats')}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Price per seat</FormLabel>
            <InputGroup>
              <InputLeftAddon>$</InputLeftAddon>
              <Input
                type="number"
                min={1}
                step="0.01"
                value={price ?? String(unitCents / 100)}
                onChange={(e) => setPrice(e.target.value)}
              />
            </InputGroup>
            <FormHelperText>
              {price === null ? (
                'Standard price for this many seats.'
              ) : (
                <Link as="button" type="button" onClick={() => setPrice(null)}>
                  Use the standard price
                </Link>
              )}
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Billing email</FormLabel>
            <Input
              type="email"
              value={f.billingEmail}
              onChange={set('billingEmail')}
              placeholder={f.email || 'Same as the teacher'}
            />
            <FormHelperText>Who pays, e.g. accounts payable.</FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Seats end</FormLabel>
            <Input type="date" value={f.endsAt} onChange={set('endsAt')} />
            <FormHelperText>Student access ends on this date.</FormHelperText>
          </FormControl>
        </SimpleGrid>
        <Flex mt={6} align="center" justify="space-between" gap={4} wrap="wrap">
          <Text>
            Invoice total: <b>{money(total)}</b>{' '}
            <Text as="span" color="text.muted" fontSize="sm">
              ({seats} × {money(unitCents)})
            </Text>
          </Text>
          <Button
            type="submit"
            colorScheme="purple"
            isLoading={saving}
            isDisabled={!seats || !f.email || !f.className}
          >
            Send invoice
          </Button>
        </Flex>
      </form>
    </Card>
  )
}

const InviteTable = ({
  invites,
  onChange,
}: {
  invites: Invite[]
  onChange: () => void
}) => {
  const toast = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const sorted = useMemo(() => invites, [invites])

  const act = async (i: Invite, action: string, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return
    setBusy(`${i.id}:${action}`)
    const r = await send(`/api/admin/teacher-invites/${i.id}`, 'POST', {
      action,
    })
    setBusy(null)
    if (!r.ok) {
      toast({ title: r.data.error || 'Something went wrong', status: 'error' })
    } else if (r.data.email && !r.data.email.sent) {
      toast({
        title: 'Email not sent',
        description: `${r.data.email.error} Copy the link and send it yourself.`,
        status: 'warning',
      })
    } else {
      toast({ title: 'Done', status: 'success' })
    }
    onChange()
  }
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: 'Link copied', status: 'success', duration: 2000 })
  }

  if (sorted.length === 0)
    return (
      <Text color="text.muted" fontSize="sm">
        No invites yet.
      </Text>
    )
  return (
    <Box overflowX="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Teacher</Th>
            <Th>Class</Th>
            <Th isNumeric>Seats</Th>
            <Th isNumeric>Total</Th>
            <Th>Status</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map((i) => (
            <Tr key={i.id} verticalAlign="top">
              <Td>
                <Text fontWeight="semibold">{i.teacherName || i.email}</Text>
                {i.teacherName && (
                  <Text fontSize="xs" color="text.muted">
                    {i.email}
                  </Text>
                )}
                {i.billingEmail !== i.email && (
                  <Text fontSize="xs" color="text.muted">
                    Billed to {i.billingEmail}
                  </Text>
                )}
              </Td>
              <Td>
                <Text>{i.className}</Text>
                <Text fontSize="xs" color="text.muted">
                  {[i.institution, `until ${shortDate(i.endsAt)}`]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Td>
              <Td isNumeric>{i.seats}</Td>
              <Td isNumeric>
                {money(i.total)}
                <Text fontSize="xs" color="text.muted">
                  {money(i.unitAmount)} each
                </Text>
              </Td>
              <Td>
                <Badge colorScheme={STATUS[i.status].color}>
                  {STATUS[i.status].label}
                </Badge>
                <Text fontSize="xs" color="text.muted" mt={1}>
                  {i.status === 'INVOICED' && `Sent ${shortDate(i.createdAt)}`}
                  {i.paidAt &&
                    i.status !== 'VOID' &&
                    `Paid ${shortDate(i.paidAt)}${
                      i.paidManually ? ' (marked by hand)' : ''
                    }`}
                </Text>
                {i.status === 'PAID' &&
                  (i.emailedAt ? (
                    <Text fontSize="xs" color="text.muted">
                      Teacher emailed {shortDate(i.emailedAt)}
                    </Text>
                  ) : i.emailError ? (
                    <Tooltip label={i.emailError}>
                      <Text fontSize="xs" color="orange.500">
                        Email not sent: copy the link
                      </Text>
                    </Tooltip>
                  ) : null)}
                {i.status === 'ACCEPTED' && i.joinCode && (
                  <Text fontSize="xs" color="text.muted">
                    Join code {i.joinCode}
                  </Text>
                )}
              </Td>
              <Td>
                <HStack justify="end" spacing={1} wrap="wrap">
                  {i.invoiceUrl && (
                    <Button
                      as="a"
                      href={i.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      size="xs"
                      variant="ghost"
                      rightIcon={<FiExternalLink />}
                    >
                      Invoice
                    </Button>
                  )}
                  {i.status === 'INVOICED' && (
                    <>
                      <Button
                        size="xs"
                        colorScheme="purple"
                        variant="outline"
                        isLoading={busy === `${i.id}:markPaid`}
                        onClick={() =>
                          act(
                            i,
                            'markPaid',
                            `Mark ${money(
                              i.total,
                            )} as paid outside Stripe (check or PO)? The teacher is invited right away.`,
                          )
                        }
                      >
                        Mark paid
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        isLoading={busy === `${i.id}:void`}
                        onClick={() =>
                          act(
                            i,
                            'void',
                            'Cancel this invite and void its invoice?',
                          )
                        }
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {i.status === 'PAID' && i.acceptUrl && (
                    <>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<FiCopy />}
                        onClick={() => copy(i.acceptUrl!)}
                      >
                        Copy link
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<FiMail />}
                        isLoading={busy === `${i.id}:resendEmail`}
                        onClick={() => act(i, 'resendEmail')}
                      >
                        Email again
                      </Button>
                    </>
                  )}
                  {i.status === 'ACCEPTED' && i.cohortId && (
                    <Button
                      as={NextLink}
                      href={`/teach/cohorts/${i.cohortId}`}
                      size="xs"
                      variant="ghost"
                    >
                      Open class
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

const RoleCard = () => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('TEACHER')
  const [saving, setSaving] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const r = await send('/api/admin/role', 'POST', { email, role })
    setSaving(false)
    if (!r.ok)
      toast({ title: r.data.error || 'Could not change role', status: 'error' })
    else {
      toast({
        title: `${email} is now ${role.toLowerCase()}`,
        status: 'success',
      })
      setEmail('')
    }
  }
  return (
    <Card>
      <Heading size="md" mb={1}>
        Roles
      </Heading>
      <Text fontSize="sm" color="text.muted" mb={4}>
        Change someone’s role directly, without an invoice (for example a
        teacher whose school already paid, or another admin). They must have
        signed in once.
      </Text>
      <form onSubmit={submit}>
        <Flex gap={3} wrap="wrap" align="end">
          <FormControl maxW="320px" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl maxW="180px">
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </FormControl>
          <Button type="submit" isLoading={saving} isDisabled={!email}>
            Save role
          </Button>
        </Flex>
      </form>
    </Card>
  )
}

export default AdminHome
