import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContent'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'

const PrelaunchHomePage = () => {
  const heroImg = '/actingAccentsHeroImg.png'
  const cardImg = '/cardBackground.png'
  return (
    <>
      <Box w='90vw' h='100vh'
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
        }}>
          <PrelaunchContent />
      </Box>
      <Box w='90vw' h='95vh' 
      style={{
        backgroundImage: `url(${cardImg})`,
        backgroundSize: 'cover',
      }}>
        <PrelaunchCardsContainer />
      </Box>
  </>
  )
}

export default PrelaunchHomePage
