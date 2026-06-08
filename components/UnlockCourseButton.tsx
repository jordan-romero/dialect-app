import React, { useEffect, useState } from 'react'
import {
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Box,
  Badge,
  Code,
  VStack,
  HStack,
} from '@chakra-ui/react'

// Opens an unlock modal and starts Stripe Checkout. For admin emails
// (ADMIN_EMAILS), the modal also shows the Stripe TEST card so the full
// purchase flow can be exercised without bypassing the paywall.
const UnlockCourseButton: React.FC<{ size?: string }> = ({ size = 'lg' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setIsAdmin(!!d.isAdmin))
      .catch(() => {})
  }, [])

  const startCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      toast({
        title: 'Checkout unavailable',
        description: data.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } catch {
      toast({ title: 'Something went wrong', status: 'error' })
    }
    setLoading(false)
  }

  return (
    <>
      <Button colorScheme="purple" size={size} onClick={onOpen}>
        Unlock the full course
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unlock the full course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.600">
              One-time payment for lifetime access to every lesson, handout, and
              exercise.
            </Text>

            {isAdmin && (
              <Box
                mt={4}
                p={3}
                bg="yellow.50"
                border="1px solid"
                borderColor="yellow.300"
                borderRadius="md"
              >
                <HStack mb={2}>
                  <Badge colorScheme="yellow">Test mode</Badge>
                  <Text fontSize="sm" fontWeight="bold">
                    Use this card at checkout
                  </Text>
                </HStack>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>
                    Card: <Code>4242 4242 4242 4242</Code>
                  </Text>
                  <Text>
                    Expiry: <Code>12 / 34</Code> (any future date)
                  </Text>
                  <Text>
                    CVC: <Code>123</Code> &nbsp; ZIP: <Code>42424</Code>
                  </Text>
                  <Text color="gray.500">
                    No real charge — this is Stripe test mode.
                  </Text>
                </VStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={startCheckout}
              isLoading={loading}
            >
              Continue to checkout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UnlockCourseButton
