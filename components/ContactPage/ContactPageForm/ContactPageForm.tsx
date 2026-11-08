import React, { useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { AnimatePresence, motion } from 'framer-motion'

const ContactPageForm = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      })

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: 'Something went wrong' }))
        setError(data.error || 'Something went wrong')
        setSuccess(false)
      } else {
        setSuccess(true)
        setFirstName('')
        setLastName('')
        setEmail('')
      }
    } catch (err) {
      console.error('Contact form error:', err)
      setError('Internal server error')
      setSuccess(false)
    }

    setLoading(false)
  }

  const inputStyles = {
    bg: 'white',
    borderColor: 'gray.200',
    borderRadius: 'xl',
    _hover: { borderColor: 'brand.purpleLight' },
    _focusVisible: {
      borderColor: 'brand.purple',
      boxShadow: '0 0 0 3px rgba(114,63,197,0.18)',
    },
  } as const

  return (
    <Box>
      <Stack spacing={2} mb={6}>
        <Heading
          as="h2"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="black"
          color="gray.900"
          letterSpacing="-0.01em"
        >
          Send us a note
        </Heading>
        <Text fontSize="sm" color="gray.500">
          We’ll never share your details and you can unsubscribe anytime.
        </Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <HStack spacing={3}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                First name
              </FormLabel>
              <Input
                size="lg"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                {...inputStyles}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Last name
              </FormLabel>
              <Input
                size="lg"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                {...inputStyles}
              />
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
              Email
            </FormLabel>
            <Input
              size="lg"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...inputStyles}
            />
          </FormControl>

          {error && (
            <Alert status="error" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <AnimatePresence>
            {success && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <HStack
                  spacing={3}
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(to-r, #F3EEFF, #E8F7F1)"
                  borderWidth="1px"
                  borderColor="green.100"
                >
                  <Box flexShrink={0} w="34px" h="34px">
                    <svg viewBox="0 0 34 34" width="34" height="34" aria-hidden>
                      <motion.circle
                        cx="17"
                        cy="17"
                        r="15"
                        fill="#38A169"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 18,
                        }}
                        style={{ originX: '50%', originY: '50%' }}
                      />
                      <motion.path
                        d="M10 17.5 L15 22 L24 12.5"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                      />
                    </svg>
                  </Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    Thanks — you’re on the list. Keep an eye on your inbox.
                  </Text>
                </HStack>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            loadingText="Sending"
            borderRadius="xl"
            rightIcon={<ArrowForwardIcon />}
            bgGradient="linear(to-r, brand.purple, brand.iris)"
            color="white"
            fontWeight="semibold"
            boxShadow="0 10px 24px -8px rgba(114,63,197,0.55)"
            _hover={{
              bgGradient: 'linear(to-r, brand.purpleLight, brand.purple)',
              transform: 'translateY(-1px)',
              boxShadow: '0 14px 28px -8px rgba(114,63,197,0.6)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="transform 0.15s, box-shadow 0.15s"
          >
            Sign me up
          </Button>
        </Stack>
      </form>
    </Box>
  )
}

export default ContactPageForm
