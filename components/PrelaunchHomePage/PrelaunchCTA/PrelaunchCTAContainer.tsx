import { HStack, Spacer } from '@chakra-ui/react'
import React from 'react'
import PrelaunchCtaFooter from './PrelaunchCtaFooter'
import PrelaunchPersonas from './PrelaunchPersonas'

const PrelaunchCTAContainer = () => {
  const ctaFooterHero = '/ctaFooterHero.png'
  return (
    <HStack pt='40' w='100%' h='100%' style={{
      backgroundImage: `url(${ctaFooterHero})`,
      backgroundSize: 'cover',
    }} justifyContent='center' alignItems='center'>
        <PrelaunchPersonas />
        {/* <Spacer w='150px' /> */}
        <PrelaunchCtaFooter />
    </HStack>
  )
}

export default PrelaunchCTAContainer