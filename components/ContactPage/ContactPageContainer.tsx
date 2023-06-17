import { Flex } from '@chakra-ui/react'
import React from 'react'
import ContactPageFormContainer from './ContactPageForm/ContactPageFormContainer'
import useMidSizeCheck from '../hooks/useMidSizeCheck'
import useMobileCheck from '../hooks/useMobileCheck'

const ContactPageContainer = () => {
  const contactPageBgImg = '/contactPageBg.png'
  const isMidsized = useMidSizeCheck()
  const isMobile = useMobileCheck()
  return (
    <Flex
      h={isMobile ? "600px" : "800px"} 
      style={
        isMidsized
          ? undefined
          : {
              backgroundImage: `url(${contactPageBgImg})`,
              backgroundSize: 'cover',
            }
      }
      alignItems="center"
    >
      <ContactPageFormContainer />
    </Flex>
  )
}

export default ContactPageContainer
