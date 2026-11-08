// "Your classes" in the profile: the cohorts this student belongs to, with a
// way to leave one (the teacher then loses access to their work).
import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react'

type MyCohort = {
  id: number
  name: string
  institution: string | null
  teacher: { firstName: string | null; lastName: string | null; email: string }
  usesSeat: boolean
  endsAt: string | null
  open: boolean
}

const MyClasses = ({ bg }: { bg: string }) => {
  const [cohorts, setCohorts] = useState<MyCohort[]>([])
  const load = useCallback(() => {
    fetch('/api/cohorts/mine')
      .then((r) => (r.ok ? r.json() : { cohorts: [] }))
      .then((d) => setCohorts(d.cohorts || []))
      .catch(() => {})
  }, [])
  useEffect(load, [load])
  if (cohorts.length === 0) return null

  const leave = async (c: MyCohort) => {
    const seat = c.usesSeat ? ' Your class seat gives you course access, so you’ll lose that access too.' : ''
    if (!window.confirm(`Leave ${c.name}? Your teacher will no longer see your progress.${seat}`)) return
    await fetch('/api/cohorts/mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaveCohortId: c.id }),
    })
    load()
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" mb={2}>
        Your classes
      </Text>
      <Stack spacing={2}>
        {cohorts.map((c) => (
          <Flex key={c.id} p={3} borderRadius="lg" bg={bg} justify="space-between" align="center" gap={3}>
            <Box minW={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {c.name}
              </Text>
              <Text fontSize="xs" color="text.muted" noOfLines={1}>
                {[c.teacher.firstName, c.teacher.lastName].filter(Boolean).join(' ') || c.teacher.email}
                {c.usesSeat && c.endsAt ? ` · access until ${new Date(c.endsAt).toLocaleDateString()}` : ''}
              </Text>
              <Text fontSize="xs" color="text.muted">
                Your teacher can see your progress and answers.
              </Text>
            </Box>
            <Button size="xs" variant="ghost" onClick={() => leave(c)}>
              Leave
            </Button>
          </Flex>
        ))}
      </Stack>
    </Box>
  )
}

export default MyClasses
