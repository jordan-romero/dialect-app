import { Box, Button, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react'
import React from 'react'

const ContactPageForm = () => {
  return (
    <Box as='form'>
      <FormControl>
        <FormLabel>First Name</FormLabel>
        <Input type='text' />
      </FormControl>
      <FormControl>
        <FormLabel>Last Name</FormLabel>
        <Input type='text' />
      </FormControl>
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input type='email' />
      </FormControl>
      <FormControl>
        <FormLabel>Questions</FormLabel>
        <Textarea />
      </FormControl>
      <Button
            mt={4}
            type='submit'
          >
            Send Message
          </Button>
    </Box>
  )
}

export default ContactPageForm