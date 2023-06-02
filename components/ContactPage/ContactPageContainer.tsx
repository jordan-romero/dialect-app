import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import ContactPageIcon from './ContactPageIcon'
import ContactPageForm from './ContactPageForm'

const ContactPageContainer = () => {
  return (
    <Box boxShadow='md'>  
        <Heading as='h1' size='2xl' noOfLines={1}>
            Have any questions?
        </Heading>
        <Flex justify='space-around'>
            <ContactPageIcon />
            <ContactPageForm />
        </Flex>
    </Box>
  )
}

export default ContactPageContainer