import { Box, useBreakpointValue } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContentContainer'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'
import useMobileCheck from '../hooks/useMobileCheck'
import PrelaunchPersonas from './PrelaunchContent/PrelaunchPersonas/PrelaunchPersonas'
import useMidSizeCheck from '../hooks/useMidSizeCheck'
import PrelaunchTestimonialsContainer from './PrelaunchTestimonials/PrelaunchTestimonialsContainer'
import { Zoom } from 'react-awesome-reveal'

import { Slide } from 'react-awesome-reveal'

const PrelaunchHomePage = () => {
  const heroImg = '/heroBgImage.svg'
  const cardImg = '/cardBgImg.svg'
  const testimonialsImg = '/testimonialsCarousel.svg'
  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()

  const containerHeight = useBreakpointValue({
    base: '1125px', // Height for mobile screens
    md: '1400px', // Height for medium-sized screens
    lg: '940px', // Height for large-sized screens
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
      <Zoom duration={2000} triggerOnce={true} fraction={0}>
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
    </>
  )
}

export default PrelaunchHomePage
