import { Box, useBreakpointValue } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContentContainer'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'
import useMobileCheck from '../hooks/useMobileCheck'
import PrelaunchPersonas from './PrelaunchContent/PrelaunchPersonas/PrelaunchPersonas'
import useMidSizeCheck from '../hooks/useMidSizeCheck'
import PrelaunchTestimonialsContainer from './PrelaunchTestimonials/PrelaunchTestimonialsContainer'
// Works in the browser, but errors in vsCode 🤷🏻‍♀️
import Zoom from 'react-reveal/Zoom'
import Fade from 'react-reveal/Fade'
import Slide from 'react-reveal/Slide'

const PrelaunchHomePage = () => {
  const heroImg = '/heroBgImage.svg'
  const cardImg = '/cardBgImg.svg'
  const testimonialsImg = '/testimonialsCarousel.svg'
  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()

  const containerHeight = useBreakpointValue({
    base: '1125px', // Height for mobile screens
    md: '1400px', // Height for medium-sized screens
    lg: '900px', // Height for large-sized screens
  })

  const cardContainerHeight = useBreakpointValue({
    base: '1100px',
    md: '1200px',
    lg: '920px',
  })

  const testimonialContainerHeight = useBreakpointValue({
    base: 'auto',
    md: '900px',
    lg: '930px',
  })

  return (
    <>
      <Box
        h={containerHeight}
        style={
          isMidSized
            ? undefined
            : {
                backgroundImage: `url(${heroImg})`,
                backgroundSize: 'cover',
              }
        }
      >
        <PrelaunchContent />
      </Box>
      <Zoom>
        <Box
          h={cardContainerHeight}
          style={
            isMidSized
              ? undefined
              : {
                  backgroundImage: `url(${cardImg})`,
                  backgroundSize: 'cover',
                }
          }
        >
          <PrelaunchCardsContainer />
        </Box>
      </Zoom>
      {isMobile ? <PrelaunchPersonas /> : null}
      <Slide top>
        <Box
          h={testimonialContainerHeight}
          style={
            isMidSized
              ? undefined
              : {
                  backgroundImage: `url(${testimonialsImg})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                }
          }
        >
          <PrelaunchTestimonialsContainer />
        </Box>
      </Slide>
    </>
  )
}

export default PrelaunchHomePage
