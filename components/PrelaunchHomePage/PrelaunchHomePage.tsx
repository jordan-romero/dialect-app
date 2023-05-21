import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContent'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'
import PrelaunchCTAContainer from './PrelaunchCTA/PrelaunchCTAContainer'

const PrelaunchHomePage = () => {
  const heroImg = '/actingAccentsHeroImg.png'
  const cardImg = '/cardBackground.png'
  
  return (
    <>
      <Box w='90vw' h='925px'
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
        }}>
          <PrelaunchContent />
      </Box>
      <Box w='90vw' h='925px' 
      style={{
        backgroundImage: `url(${cardImg})`,
        backgroundSize: 'cover',
      }}>
        <PrelaunchCardsContainer />
      </Box>
      <Box w='90vw' h='925px' 
      >
        <PrelaunchCTAContainer />
      </Box>
  </>
  )
}

export default PrelaunchHomePage
