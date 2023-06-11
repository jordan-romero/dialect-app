import { Flex } from '@chakra-ui/react'
import React from 'react'
import ContactPageFormContainer from './ContactPageForm/ContactPageFormContainer'
import useMidSizeCheck from '../hooks/useMidSizeCheck'

const ContactPageContainer = () => {
const contactPageBgImg = '/contactPageBg.png'
const isMidsized = useMidSizeCheck()
  return (
    <Flex 
    h='800px'
      style={
        isMidsized
          ? undefined
          : {
              backgroundImage: `url(${contactPageBgImg})`,
              backgroundSize: 'cover',
            }
      }
      alignItems='center'
    > 
        <ContactPageFormContainer />
    </Flex>
  )
}

export default ContactPageContainer