import { Flex } from '@chakra-ui/react'
import React from 'react'
import ContactPageIcon from './ContactPageIcon'
import ContactPageForm from './ContactPageForm'

const ContactPageFormContainer = () => {
  return (
    <Flex  borderRadius="10" boxShadow="dark-lg" w='75%' h='600px' mr='auto' ml='auto' mt={10} mb={10} p={10} alignItems='center' justifyContent='space-around' bg='util.white'> 
        <ContactPageIcon />
        <ContactPageForm />
    </Flex>
  )
}

export default ContactPageFormContainer