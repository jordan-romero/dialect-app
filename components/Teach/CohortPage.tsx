import React, { useEffect, useMemo, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useClipboard,
  useToast,
} from '@chakra-ui/react'
import { FiArrowLeft, FiCopy, FiDownload, FiPrinter, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import QrCode from './QrCode'
import { csv, downloadText, money, relative, send, shortDate, useJson } from './util'

type RosterRow = {
  userId: number
  email: string
  name: string | null
  joinedAt: string
  usesSeat: boolean
  lessonsCompleted: number
  totalLessons: number
  currentLesson: { id: number; title: string; courseTitle: string } | null
  exercisesSubmitted: number
  totalExercises: number
  lastActive: string | null
}
type Invite = { id: number; email: string; url: string; createdAt: string; acceptedAt: string | null }
type SeatTier = { minSeats: number; unitAmount: number; label: string }
type CohortDetail = {
  cohort: {
    id: number
    name: string
    institution: string | null
    paymentMode: 'SELF_PAY' | 'SEATS'
    seatCount: number
    seatsUsed: number
    joinCode: string
    joinEnabled: boolean
    joinUrl: string
    startsAt: string | null
    endsAt: string | null
    archivedAt: string | null
    open: boolean
  }
  roster: RosterRow[]
  invites: Invite[]
  purchases: { id: number; quantity: number; amountTotal: number; amountRefunded: number; currency: string; status: string; createdAt: string }[]
  seatTiers: SeatTier[]
}

const Card = (props: React.ComponentProps<typeof Box>) => (
  <Box bg="surface.card" borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p={5} {...props} />
)

const CohortPage = ({ id }: { id: string }) => {
  const router = useRouter()
  const toast = useToast()
  const { data, error, loading, reload } = useJson<CohortDetail>(`/api/teach/cohorts/${id}`)

  useEffect(() => {
    const s = router.query.seats
    if (s === 'success') {
      toast({ title: 'Payment received', description: 'Seats appear here as soon as Stripe confirms.', status: 'success' })
      // The webhook may land a moment after the redirect.
      const t = setTimeout(reload, 2500)
      router.replace(`/teach/cohorts/${id}`, undefined, { shallow: true })
      return () => clearTimeout(t)
    }
    if (s === 'cancelled') router.replace(`/teach/cohorts/${id}`, undefined, { shallow: true })
  }, [router.query.seats]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">{error}</Text>
        <Link as={NextLink} href="/teach" color="brand.iris">
          Back to your classes
        </Link>
      </Box>
    )
  }
  if (loading && !data) {
    return (
      <Stack p={8} spacing={4} maxW="1200px" mx="auto">
        <Skeleton h="40px" w="300px" />
        <Skeleton h="160px" />
        <Skeleton h="320px" />
      </Stack>
    )
  }
  if (!data) return null
  const c = data.cohort
  const seats = c.paymentMode === 'SEATS'
  const over = seats ? Math.max(0, c.seatsUsed - c.seatCount) : 0

  const patch = async (body: Record<string, unknown>, ok?: string) => {
    const r = await send(`/api/teach/cohorts/${c.id}`, 'PATCH', body)
    if (!r.ok) toast({ title: r.data.error || 'Could not save', status: 'error' })
    else if (ok) toast({ title: ok, status: 'success' })
    reload()
  }

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <Link as={NextLink} href="/teach" color="text.muted" fontSize="sm" display="inline-flex" alignItems="center" gap={1}>
        <FiArrowLeft /> Your classes
      </Link>
      <Flex mt={2} mb={6} justify="space-between" align="start" gap={4} wrap="wrap">
        <Box>
          <Heading size="lg">{c.name}</Heading>
          <Text color="text.muted" mt={1}>
            {[c.institution, c.startsAt && `Starts ${shortDate(c.startsAt)}`, c.endsAt && `Ends ${shortDate(c.endsAt)}`]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Box>
        <HStack>
          {c.archivedAt ? <Badge>Archived</Badge> : !c.open ? <Badge colorScheme="orange">Ended</Badge> : null}
          <Button size="sm" variant="outline" onClick={() => patch({ archived: !c.archivedAt }, c.archivedAt ? 'Class restored' : 'Class archived')}>
            {c.archivedAt ? 'Restore' : 'Archive'}
          </Button>
        </HStack>
      </Flex>

      {over > 0 && (
        <Alert status="warning" borderRadius="md" mb={4}>
          <AlertIcon />
          {over} more student{over === 1 ? ' is' : 's are'} using seats than this class has, after a refund. Add seats or remove students.
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} mb={6}>
        <Card>
          <Text fontSize="sm" color="text.muted">
            Students
          </Text>
          <Heading size="xl">{data.roster.length}</Heading>
          {seats ? (
            <>
              <Text mt={3} fontSize="sm">
                <b>{c.seatsUsed}</b> of <b>{c.seatCount}</b> seats used ·{' '}
                <b>{Math.max(0, c.seatCount - c.seatsUsed)}</b> left
              </Text>
              <Progress mt={2} value={c.seatCount ? (c.seatsUsed / c.seatCount) * 100 : 0} colorScheme={over ? 'orange' : 'purple'} borderRadius="full" size="sm" />
              <Text mt={2} fontSize="xs" color="text.muted">
                Students who already own the course don’t use a seat.
              </Text>
            </>
          ) : (
            <Text mt={3} fontSize="sm" color="text.muted">
              Students buy the course themselves after joining.
            </Text>
          )}
        </Card>
        <ShareCard cohort={c} onPatch={patch} />
        {seats ? <BuySeatsCard cohortId={c.id} tiers={data.seatTiers} disabled={!c.open} /> : <InviteCard cohortId={c.id} onDone={reload} />}
      </SimpleGrid>

      {seats && (
        <Box mb={6}>
          <InviteCard cohortId={c.id} onDone={reload} wide />
        </Box>
      )}

      <RosterTable cohortId={c.id} cohortName={c.name} rows={data.roster} onChange={reload} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} mt={6}>
        <PendingInvites cohortId={c.id} invites={data.invites} onChange={reload} />
        {seats && data.purchases.length > 0 && (
          <Card>
            <Heading size="sm" mb={3}>
              Seat purchases
            </Heading>
            <Table size="sm">
              <Tbody>
                {data.purchases.map((p) => (
                  <Tr key={p.id}>
                    <Td px={0}>{shortDate(p.createdAt)}</Td>
                    <Td>{p.quantity} seats</Td>
                    <Td>{money(p.amountTotal, p.currency)}</Td>
                    <Td px={0} textAlign="right">
                      <Badge colorScheme={p.status === 'PAID' ? 'green' : p.status === 'DISPUTED' ? 'orange' : 'gray'}>
                        {p.amountRefunded > 0 && p.status === 'PAID' ? 'Partly refunded' : p.status.toLowerCase()}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>
        )}
      </SimpleGrid>
    </Box>
  )
}

const ShareCard = ({
  cohort,
  onPatch,
}: {
  cohort: CohortDetail['cohort']
  onPatch: (b: Record<string, unknown>, ok?: string) => Promise<void>
}) => {
  const link = useClipboard(cohort.joinUrl)
  return (
    <Card>
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" color="text.muted">
          Join code
        </Text>
        <HStack spacing={2}>
          <Text fontSize="xs" color="text.muted">
            {cohort.joinEnabled ? 'On' : 'Off'}
          </Text>
          <Switch
            size="sm"
            colorScheme="purple"
            isChecked={cohort.joinEnabled}
            onChange={(e) => onPatch({ joinEnabled: e.target.checked })}
            aria-label="Allow joining with the code"
          />
        </HStack>
      </Flex>
      <Flex gap={4} mt={2} align="start">
        <Box flex="1" minW={0}>
          <Heading size="xl" fontFamily="mono" letterSpacing="wider" opacity={cohort.joinEnabled ? 1 : 0.4}>
            {cohort.joinCode}
          </Heading>
          <Text fontSize="xs" color="text.muted" mt={1} noOfLines={1}>
            {cohort.joinUrl.replace(/^https?:\/\//, '')}
          </Text>
          <Stack mt={3} spacing={2} align="start">
            <Button size="xs" leftIcon={<FiCopy />} onClick={link.onCopy} variant="outline">
              {link.hasCopied ? 'Copied' : 'Copy link'}
            </Button>
            <Button size="xs" leftIcon={<FiPrinter />} as={NextLink} href={`/teach/cohorts/${cohort.id}/print`} target="_blank" variant="outline">
              Print QR page
            </Button>
            <Tooltip label="Old codes, links and printed QR codes stop working">
              <Button
                size="xs"
                leftIcon={<FiRefreshCw />}
                variant="ghost"
                onClick={() => {
                  if (window.confirm('Make a new code? The old code, link and any printed QR codes will stop working.'))
                    onPatch({ rotateJoinCode: true }, 'New join code made')
                }}
              >
                New code
              </Button>
            </Tooltip>
          </Stack>
        </Box>
        {cohort.joinEnabled && <QrCode url={cohort.joinUrl} size={112} showDownloads downloadName={`join-${cohort.joinCode}`} />}
      </Flex>
    </Card>
  )
}

const BuySeatsCard = ({ cohortId, tiers, disabled }: { cohortId: number; tiers: SeatTier[]; disabled: boolean }) => {
  const toast = useToast()
  const [qty, setQty] = useState(25)
  const [busy, setBusy] = useState(false)
  const tier = [...tiers].reverse().find((t) => qty >= t.minSeats) || tiers[0]
  const buy = async () => {
    setBusy(true)
    const r = await send(`/api/teach/cohorts/${cohortId}/checkout`, 'POST', { quantity: qty })
    if (r.ok && r.data.url) {
      window.location.href = r.data.url
      return
    }
    toast({ title: r.data.error || 'Could not start checkout', status: 'error' })
    setBusy(false)
  }
  return (
    <Card>
      <Text fontSize="sm" color="text.muted">
        Buy seats
      </Text>
      <HStack mt={2} align="end">
        <NumberInput value={qty} min={1} max={500} onChange={(_, n) => setQty(Number.isFinite(n) ? n : 1)} w="110px">
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Box>
          <Text fontWeight="bold">{money(tier.unitAmount * qty)}</Text>
          <Text fontSize="xs" color="text.muted">
            {money(tier.unitAmount)} per seat
          </Text>
        </Box>
      </HStack>
      <HStack mt={3} spacing={3} fontSize="xs" color="text.muted" wrap="wrap">
        {tiers.map((t) => (
          <Text key={t.minSeats} fontWeight={t === tier ? 'bold' : undefined} color={t === tier ? 'text.primary' : undefined}>
            {t.label}: {money(t.unitAmount)}
          </Text>
        ))}
      </HStack>
      <Button mt={4} colorScheme="purple" size="sm" onClick={buy} isLoading={busy} isDisabled={disabled || qty < 1}>
        Buy {qty} seat{qty === 1 ? '' : 's'}
      </Button>
      <Text mt={2} fontSize="xs" color="text.muted">
        Seats last until the class end date. You get a Stripe invoice for your records.
      </Text>
    </Card>
  )
}

const InviteCard = ({ cohortId, onDone, wide }: { cohortId: number; onDone: () => void; wide?: boolean }) => {
  const toast = useToast()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [made, setMade] = useState<{ email: string; url: string }[]>([])
  const all = useClipboard(made.map((m) => `${m.email}\t${m.url}`).join('\n'))
  const submit = async () => {
    setBusy(true)
    const r = await send(`/api/teach/cohorts/${cohortId}/invites`, 'POST', { emails: text })
    setBusy(false)
    if (!r.ok) {
      toast({ title: r.data.error || 'Could not create invites', status: 'error' })
      return
    }
    setMade(r.data.invites)
    setText('')
    if (r.data.invalid?.length) toast({ title: `Skipped: ${r.data.invalid.join(', ')}`, status: 'warning' })
    onDone()
  }
  return (
    <Card>
      <Text fontSize="sm" color="text.muted">
        Invite by email
      </Text>
      <Flex gap={4} direction={wide ? { base: 'column', md: 'row' } : 'column'} mt={2}>
        <Box flex="1">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste student emails, separated by commas or new lines"
            rows={wide ? 3 : 4}
            fontSize="sm"
          />
          <Button mt={2} size="sm" colorScheme="purple" onClick={submit} isLoading={busy} isDisabled={!text.trim()}>
            Create invite links
          </Button>
          <Text mt={2} fontSize="xs" color="text.muted">
            Each link only works for that email address. Send them yourself for now; the app doesn’t email students yet.
          </Text>
        </Box>
        {made.length > 0 && (
          <Box flex="1" minW={0}>
            <Flex justify="space-between" align="center" mb={1}>
              <Text fontSize="sm" fontWeight="bold">
                {made.length} link{made.length === 1 ? '' : 's'} ready
              </Text>
              <Button size="xs" leftIcon={<FiCopy />} onClick={all.onCopy}>
                {all.hasCopied ? 'Copied' : 'Copy all'}
              </Button>
            </Flex>
            <Box maxH="140px" overflowY="auto" fontSize="xs" fontFamily="mono" bg="surface.subtle" p={2} borderRadius="md">
              {made.map((m) => (
                <Text key={m.email} noOfLines={1}>
                  {m.email} {m.url}
                </Text>
              ))}
            </Box>
          </Box>
        )}
      </Flex>
    </Card>
  )
}

const PendingInvites = ({ cohortId, invites, onChange }: { cohortId: number; invites: Invite[]; onChange: () => void }) => {
  const pending = invites.filter((i) => !i.acceptedAt)
  if (pending.length === 0) return null
  return (
    <Card>
      <Heading size="sm" mb={3}>
        Pending invites ({pending.length})
      </Heading>
      <Stack spacing={1} maxH="260px" overflowY="auto">
        {pending.map((i) => (
          <InviteRow key={i.id} cohortId={cohortId} invite={i} onChange={onChange} />
        ))}
      </Stack>
    </Card>
  )
}

const InviteRow = ({ cohortId, invite, onChange }: { cohortId: number; invite: Invite; onChange: () => void }) => {
  const clip = useClipboard(invite.url)
  return (
    <Flex align="center" justify="space-between" gap={2} fontSize="sm">
      <Text noOfLines={1}>{invite.email}</Text>
      <HStack spacing={1}>
        <Tooltip label={clip.hasCopied ? 'Copied' : 'Copy invite link'}>
          <IconButton aria-label="Copy invite link" icon={<FiCopy />} size="xs" variant="ghost" onClick={clip.onCopy} />
        </Tooltip>
        <Tooltip label="Cancel invite">
          <IconButton
            aria-label="Cancel invite"
            icon={<FiTrash2 />}
            size="xs"
            variant="ghost"
            onClick={async () => {
              await send(`/api/teach/cohorts/${cohortId}/invites?inviteId=${invite.id}`, 'DELETE')
              onChange()
            }}
          />
        </Tooltip>
      </HStack>
    </Flex>
  )
}

type SortKey = 'name' | 'progress' | 'exercises' | 'lastActive' | 'joined'

const RosterTable = ({ cohortId, cohortName, rows, onChange }: { cohortId: number; cohortName: string; rows: RosterRow[]; onChange: () => void }) => {
  const [sort, setSort] = useState<SortKey>('name')
  const [q, setQ] = useState('')
  const toast = useToast()
  const sorted = useMemo(() => {
    const f = rows.filter((r) => !q || `${r.name || ''} ${r.email}`.toLowerCase().includes(q.toLowerCase()))
    const by: Record<SortKey, (a: RosterRow, b: RosterRow) => number> = {
      name: (a, b) => (a.name || a.email).localeCompare(b.name || b.email),
      progress: (a, b) => b.lessonsCompleted - a.lessonsCompleted,
      exercises: (a, b) => b.exercisesSubmitted - a.exercisesSubmitted,
      lastActive: (a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''),
      joined: (a, b) => a.joinedAt.localeCompare(b.joinedAt),
    }
    return [...f].sort(by[sort])
  }, [rows, sort, q])

  const exportCsv = () => {
    downloadText(
      `${cohortName.replace(/[^\w-]+/g, '_')}_roster.csv`,
      csv([
        ['Name', 'Email', 'Lessons completed', 'Total lessons', 'Current lesson', 'Exercises submitted', 'Last active', 'Joined', 'Uses seat'],
        ...sorted.map((r) => [
          r.name,
          r.email,
          r.lessonsCompleted,
          r.totalLessons,
          r.currentLesson?.title ?? 'Finished',
          r.exercisesSubmitted,
          r.lastActive,
          r.joinedAt,
          r.usesSeat ? 'yes' : 'no',
        ]),
      ]),
    )
  }

  const remove = async (r: RosterRow) => {
    if (!window.confirm(`Remove ${r.name || r.email} from this class? Their seat is freed and you won't see their work. Their own progress is kept.`)) return
    const res = await send(`/api/teach/cohorts/${cohortId}/members/${r.userId}`, 'DELETE')
    if (!res.ok) toast({ title: res.data.error || 'Could not remove', status: 'error' })
    onChange()
  }

  const H = ({ k, children, isNumeric }: { k: SortKey; children: React.ReactNode; isNumeric?: boolean }) => (
    <Th isNumeric={isNumeric} cursor="pointer" onClick={() => setSort(k)} color={sort === k ? 'brand.iris' : undefined} userSelect="none">
      {children}
      {sort === k ? ' ↓' : ''}
    </Th>
  )

  return (
    <Card p={0} overflow="hidden">
      <Flex p={5} pb={3} justify="space-between" align="center" gap={3} wrap="wrap">
        <Heading size="md">Roster</Heading>
        <HStack>
          <Input size="sm" placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} w="200px" />
          <Button size="sm" leftIcon={<FiDownload />} variant="outline" onClick={exportCsv} isDisabled={rows.length === 0}>
            CSV
          </Button>
        </HStack>
      </Flex>
      {rows.length === 0 ? (
        <Text px={5} pb={6} color="text.muted">
          No students yet. Share the join code, link or QR code, or create invite links.
        </Text>
      ) : (
        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <H k="name">Student</H>
                <H k="progress">Lessons</H>
                <Th>Current lesson</Th>
                <H k="exercises" isNumeric>
                  Exercises
                </H>
                <H k="lastActive">Last active</H>
                <H k="joined">Joined</H>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {sorted.map((r) => (
                <Tr key={r.userId} _hover={{ bg: 'surface.hover' }}>
                  <Td>
                    <Link as={NextLink} href={`/teach/cohorts/${cohortId}/students/${r.userId}`} fontWeight="semibold" color="brand.iris">
                      {r.name || r.email}
                    </Link>
                    {r.name && (
                      <Text fontSize="xs" color="text.muted">
                        {r.email}
                      </Text>
                    )}
                  </Td>
                  <Td minW="140px">
                    <Text fontSize="sm">
                      {r.lessonsCompleted} / {r.totalLessons}
                    </Text>
                    <Progress value={r.totalLessons ? (r.lessonsCompleted / r.totalLessons) * 100 : 0} size="xs" colorScheme="purple" borderRadius="full" mt={1} />
                  </Td>
                  <Td maxW="240px">
                    {r.currentLesson ? (
                      <>
                        <Text fontSize="sm" noOfLines={1}>
                          {r.currentLesson.title}
                        </Text>
                        <Text fontSize="xs" color="text.muted" noOfLines={1}>
                          {r.currentLesson.courseTitle}
                        </Text>
                      </>
                    ) : (
                      <Badge colorScheme="green">Finished</Badge>
                    )}
                  </Td>
                  <Td isNumeric>
                    {r.exercisesSubmitted} / {r.totalExercises}
                  </Td>
                  <Td whiteSpace="nowrap">{relative(r.lastActive)}</Td>
                  <Td whiteSpace="nowrap">{shortDate(r.joinedAt)}</Td>
                  <Td textAlign="right">
                    <Tooltip label="Remove from class">
                      <IconButton aria-label="Remove from class" icon={<FiTrash2 />} size="xs" variant="ghost" onClick={() => remove(r)} />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Card>
  )
}

export default CohortPage
