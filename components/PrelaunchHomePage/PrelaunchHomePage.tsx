import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContentContainer'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'
import useMobileCheck from '../hooks/useMobileCheck'
import PrelaunchPersonas from './PrelaunchContent/PrelaunchPersonas/PrelaunchPersonas'

const PrelaunchHomePage = () => {
  const heroImg = '/actingAccentsHeroImg.png'
  const cardImg = '/cardBackground.png'
  const isMobile = useMobileCheck()

  return (
    <>
      <Box
        h={isMobile ? '1125px' : '900px'}
        style={
          isMobile
            ? undefined
            : {
                backgroundImage: `url(${heroImg})`,
                backgroundSize: 'cover',
              }
        }
      >
        <PrelaunchContent />
      </Box>
      <Box
        h={isMobile ? '1100px' : '925px'}
        style={
          isMobile
            ? undefined
            : {
                backgroundImage: `url(${cardImg})`,
                backgroundSize: 'cover',
              }
        }
      >
        <PrelaunchCardsContainer />
      </Box>
      {isMobile ? <PrelaunchPersonas /> : null}
    </>
  )
}

export default PrelaunchHomePage
