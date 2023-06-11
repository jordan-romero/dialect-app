import React, { useState } from 'react'
import { Input, Button, Stack, Box, Heading } from '@chakra-ui/react'
import useMobileCheck from '../../hooks/useMobileCheck'

const ContactPageForm = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isMobile = useMobileCheck()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!email || !email.length) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError(null)

    const data = {
      email,
      firstName,
      lastName,
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const { error } = await response.json()
        setError(error)
        setSuccess(false)
      } else {
        setSuccess(true)
        setFirstName('')
        setLastName('')
        setEmail('')
      }
    } catch (error) {
      console.log(error)
      setError('Internal server error')
      setSuccess(false)
    }

    setLoading(false)
  }

  return (
    <Box w={isMobile ? '100%' : '50%'}>
        <Heading as="h1" size="2xl" textAlign="center" color='brand.iris' mb={8}>
            Contact Us
        </Heading>
    <form onSubmit={handleSubmit}>
      <Stack spacing={10}>
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <div>{error}</div>}
        {success && <div>Thank you for subscribing!</div>}
        <Button type="submit" isLoading={loading} variant='brandBold'>
          Subscribe
        </Button>
      </Stack>
    </form>
    </Box>
  )
}

export default ContactPageForm
