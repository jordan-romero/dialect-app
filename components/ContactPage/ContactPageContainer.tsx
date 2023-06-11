import { Flex } from '@chakra-ui/react'
import React from 'react'
import ContactPageFormContainer from './ContactPageForm/ContactPageFormContainer'
import useMobileCheck from '../hooks/useMobileCheck'

const ContactPageContainer = () => {
const contactPageBgImg = '/contactPageBg.png'
const isMobile = useMobileCheck()
  return (
    <Flex 
    h='800px'
      style={
        isMobile
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