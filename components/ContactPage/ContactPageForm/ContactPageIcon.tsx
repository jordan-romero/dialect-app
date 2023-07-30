import { Box, Icon } from '@chakra-ui/react'
import React from 'react'
import { FaEnvelopeOpenText } from 'react-icons/fa'

const ContactPageIcon = () => {
  return (
    <Box>
      <Icon as={FaEnvelopeOpenText} boxSize={96} mr={4} color="brand.iris" />
    </Box>
  )
}

export default ContactPageIcon
