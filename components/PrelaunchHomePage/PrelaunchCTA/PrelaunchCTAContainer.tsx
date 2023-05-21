import { HStack, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'
import PrelaunchCtaFooter from './PrelaunchCtaFooter'
import PrelaunchPersonas from './PrelaunchPersonas'
import useMobileCheck from '../../hooks/useMobileCheck'

const PrelaunchCTAContainer = () => {
  const ctaFooterHero = '/ctaFooterHero.png'
  const isMobile = useMobileCheck()
  return isMobile ? (
    <VStack pt={isMobile ? '10' : '40'} w="100%" h="100%">
      <PrelaunchPersonas />
      <PrelaunchCtaFooter />
    </VStack>
  ) : (
    <HStack
      pt="40"
      w="100%"
      h="100%"
      style={{
        backgroundImage: `url(${ctaFooterHero})`,
        backgroundSize: 'cover',
      }}
      justifyContent="center"
      alignItems="center"
    >
      <PrelaunchPersonas />
      <PrelaunchCtaFooter />
    </HStack>
  );
}

export default PrelaunchCTAContainer