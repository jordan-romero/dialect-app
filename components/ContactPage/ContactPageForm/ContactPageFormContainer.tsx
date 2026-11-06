import React from 'react'
import { Box } from '@chakra-ui/react'
import ContactPageForm from './ContactPageForm'

const ContactPageFormContainer = () => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.100"
      boxShadow="0 1px 2px rgba(17,24,39,0.04), 0 24px 56px -20px rgba(30,20,70,0.22)"
      p={{ base: 6, md: 10 }}
      w="100%"
      maxW="520px"
      ml={{ base: 0, lg: 'auto' }}
    >
      <ContactPageForm />
    </Box>
  )
}

export default ContactPageFormContainer
