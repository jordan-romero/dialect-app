import { Box, Icon } from '@chakra-ui/react'
import React from 'react'
import { FaEnvelopeOpenText } from 'react-icons/fa'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'

const ContactPageIcon = () => {
    const isMidsized = useMidSizeCheck()
  return (
    <Box>
        <Icon as={FaEnvelopeOpenText} boxSize={isMidsized ? 64 : 96} mr={4} color="brand.iris" />
    </Box>
  )
}

export default ContactPageIcon