import React, { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { EmailIcon } from '@chakra-ui/icons'

const PrelaunchCta = () => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: 'Email is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Almost there!',
          description: data.message,
          status: 'success',
          duration: 6000,
          isClosable: true,
        })
        setEmail('')
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description:
          'An error occurred while subscribing. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack spacing={3} id="early-access" scrollMarginTop="96px">
      <Text fontSize="md" fontWeight="semibold" color="gray.700">
        Join the early-access list for a launch-day discount.
      </Text>
      <Box as="form" onSubmit={handleSubmit}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          gap={3}
          align="stretch"
          maxW="520px"
        >
          <InputGroup size="lg" flex="1">
            <InputLeftElement pointerEvents="none" color="gray.400">
              <EmailIcon />
            </InputLeftElement>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              bg="white"
              borderColor="gray.200"
              borderRadius="xl"
              _placeholder={{ color: 'gray.400' }}
              _hover={{ borderColor: 'brand.purpleLight' }}
              _focusVisible={{
                borderColor: 'brand.purple',
                boxShadow: '0 0 0 3px rgba(114,63,197,0.18)',
              }}
            />
          </InputGroup>
          <Button
            type="submit"
            size="lg"
            px={7}
            borderRadius="xl"
            isLoading={isSubmitting}
            loadingText="Signing up"
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
            Get early access
          </Button>
        </Flex>
      </Box>
      <HStack spacing={2} color="gray.500" fontSize="sm">
        <Box w="5px" h="5px" borderRadius="full" bg="green.400" />
        <Text>No spam. Unsubscribe anytime.</Text>
      </HStack>
    </Stack>
  )
}

export default PrelaunchCta
