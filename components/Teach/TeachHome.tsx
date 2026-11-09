import React, { useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { FiPlus, FiUsers } from 'react-icons/fi'
import { send, shortDate, useJson } from './util'

type CohortSummary = {
  id: number
  name: string
  institution: string | null
  paymentMode: 'SELF_PAY' | 'SEATS'
  seatCount: number
  seatsUsed: number
  students: number
  joinCode: string
  endsAt: string | null
  archivedAt: string | null
  open: boolean
}

const TeachHome = () => {
  const { data, loading, error } = useJson<{ cohorts: CohortSummary[] }>(
    '/api/teach/cohorts',
  )
  const create = useDisclosure()
  const cohorts = data?.cohorts || []

  return (
    <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <Flex align="center" justify="space-between" mb={6} gap={4} wrap="wrap">
        <Box>
          <Heading size="lg">Your classes</Heading>
          <Text color="text.muted" mt={1}>
            Invite students, track their progress and read their answers.
          </Text>
        </Box>
        <Button
          colorScheme="purple"
          leftIcon={<FiPlus />}
          onClick={create.onOpen}
        >
          New class
        </Button>
      </Flex>

      {error && <Text color="red.500">{error}</Text>}
      {loading && !data ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Skeleton h="140px" borderRadius="lg" />
          <Skeleton h="140px" borderRadius="lg" />
        </SimpleGrid>
      ) : cohorts.length === 0 ? (
        <Box
          bg="surface.card"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="lg"
          p={10}
          textAlign="center"
        >
          <Box as={FiUsers} boxSize={8} mx="auto" color="text.muted" />
          <Heading size="md" mt={3}>
            No classes yet
          </Heading>
          <Text color="text.muted" mt={2}>
            Create a class, then share its code, link or QR code with your
            students.
          </Text>
          <Button mt={5} colorScheme="purple" onClick={create.onOpen}>
            Create your first class
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {cohorts.map((c) => (
            <Box
              key={c.id}
              as={NextLink}
              href={`/teach/cohorts/${c.id}`}
              bg="surface.card"
              borderWidth="1px"
              borderColor="border.subtle"
              borderRadius="lg"
              p={5}
              _hover={{ borderColor: 'brand.iris', boxShadow: 'sm' }}
              opacity={c.open ? 1 : 0.7}
            >
              <Flex justify="space-between" align="start" gap={3}>
                <Box minW={0}>
                  <Heading size="md" noOfLines={1}>
                    {c.name}
                  </Heading>
                  {c.institution && (
                    <Text color="text.muted" fontSize="sm" noOfLines={1}>
                      {c.institution}
                    </Text>
                  )}
                </Box>
                {c.archivedAt ? (
                  <Badge>Archived</Badge>
                ) : !c.open ? (
                  <Badge colorScheme="orange">Ended</Badge>
                ) : (
                  <Badge colorScheme="purple" fontFamily="mono">
                    {c.joinCode}
                  </Badge>
                )}
              </Flex>
              <Flex mt={4} gap={6} fontSize="sm" wrap="wrap">
                <Text>
                  <b>{c.students}</b> student{c.students === 1 ? '' : 's'}
                </Text>
                {c.paymentMode === 'SEATS' ? (
                  <Text>
                    <b>{c.seatsUsed}</b> of {c.seatCount} seats used
                  </Text>
                ) : (
                  <Text color="text.muted">Students pay for themselves</Text>
                )}
                {c.endsAt && (
                  <Text color="text.muted">Ends {shortDate(c.endsAt)}</Text>
                )}
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <CreateCohortModal isOpen={create.isOpen} onClose={create.onClose} />
    </Box>
  )
}

const CreateCohortModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [paymentMode, setPaymentMode] = useState<'SEATS' | 'SELF_PAY'>('SEATS')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    const r = await send('/api/teach/cohorts', 'POST', {
      name,
      institution,
      paymentMode,
      startsAt: startsAt || null,
      // End of the chosen day, local time.
      endsAt: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
    })
    if (!r.ok) {
      setSaving(false)
      toast({
        title: r.data.error || 'Could not create the class',
        status: 'error',
      })
      return
    }
    // Keep the button busy until the class page has loaded, so a slow page
    // load doesn't look like nothing happened (and invite a second click).
    await router.push(`/teach/cohorts/${r.data.id}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg="surface.card">
        <ModalHeader>New class</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Class name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="THTR 210 Voice & Speech, Spring 2027"
              />
            </FormControl>
            <FormControl>
              <FormLabel>School or program</FormLabel>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Optional"
              />
            </FormControl>
            <FormControl>
              <FormLabel>How do students get access?</FormLabel>
              <RadioGroup
                value={paymentMode}
                onChange={(v) => setPaymentMode(v as 'SEATS' | 'SELF_PAY')}
              >
                <Stack>
                  <Radio value="SEATS">
                    <b>I buy seats for the class.</b> Students join for free,
                    one seat each.
                  </Radio>
                  <Radio value="SELF_PAY">
                    <b>Students buy the course themselves.</b> They join your
                    class, then pay.
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
              <FormControl>
                <FormLabel>Starts</FormLabel>
                <Input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired={paymentMode === 'SEATS'}>
                <FormLabel>Ends</FormLabel>
                <Input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </FormControl>
            </Flex>
            {paymentMode === 'SEATS' && (
              <Text fontSize="sm" color="text.muted" mt={-2}>
                Seat access ends on the end date. Students keep their work and
                can buy the course to continue.
              </Text>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={submit}
            isLoading={saving}
            isDisabled={!name.trim() || (paymentMode === 'SEATS' && !endsAt)}
          >
            Create class
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TeachHome
