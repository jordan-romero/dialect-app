import { Flex, useMediaQuery } from '@chakra-ui/react'
import React from 'react'
import ContactPageIcon from './ContactPageIcon'
import ContactPageForm from './ContactPageForm'
import useMobileCheck from '../../hooks/useMobileCheck'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'

const ContactPageFormContainer = () => {
  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()
  return (
    <Flex
      borderRadius="10"
      boxShadow="dark-lg"
      w={isMidSized ? '95%' : '75%'}
      h={isMidSized ? '450px' : '600px'}
      mr="auto"
      ml="auto"
      mt={10}
      mb={10}
      p={10}
      alignItems="center"
      justifyContent="space-around"
      bg="util.white"
    >
      {!isMobile && <ContactPageIcon />}
      <ContactPageForm />
    </Flex>
  )
}

export default ContactPageFormContainer
