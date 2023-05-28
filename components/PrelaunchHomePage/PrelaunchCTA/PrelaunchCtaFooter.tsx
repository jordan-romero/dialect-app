import React, { useState } from 'react'
import { Box, Input, Button, useToast, Heading, Flex } from '@chakra-ui/react'
import { EmailIcon } from '@chakra-ui/icons'
import useMobileCheck from '../../hooks/useMobileCheck'

const PrelaunchCtaFooter = () => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const isMobile = useMobileCheck()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
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

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success!',
          description: data.message,
          status: 'success',
          duration: 3000,
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
    }
  }

  return (
    <>
      {isMobile && (
        <Box
          as="form"
          onSubmit={handleSubmit}
          w="100%"
          h="300px"
          bg="brand.purple"
          borderRadius="10"
          p="5"
          mt="9"
          textAlign="center"
        >
          <Heading fontSize="3xl" mb="9" color="white">
            Sign up now for an Early Bird Discount!
          </Heading>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb={5}
            bg="white"
            isRequired
            borderRadius="md"
            borderColor="white"
            _placeholder={{ color: 'black' }}
            _focus={{ borderColor: 'brand.olive', boxShadow: 'outline' }}
            _hover={{ bg: 'gray.200' }}
          />
          <Button
            leftIcon={<EmailIcon />}
            type="submit"
            variant="brandWhite"
            mt="5"
            w="250px"
            fontSize="lg"
          >
            Sign up now
          </Button>
        </Box>
      )}
      {!isMobile && (
        <Box as="form" onSubmit={handleSubmit} borderRadius="5">
          <Flex flexDirection="column" w="300px">
            <Heading fontSize="4xl" mb="7">
              Sign up now for an Early Bird Discount!
            </Heading>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              mb={4}
              w="350px"
              isRequired
              borderRadius="md"
              borderColor="brand.green"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ borderColor: 'brand.olive', boxShadow: 'outline' }}
              _hover={{ bg: 'gray.200' }}
            />
            <Button
              leftIcon={<EmailIcon />}
              type="submit"
              variant="brandBold"
              mt="5"
              w="200px"
            >
              Sign up now
            </Button>
          </Flex>
        </Box>
      )}
    </>
  )
}

export default PrelaunchCtaFooter
