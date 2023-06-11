import React from 'react'
import AboutCard from './AboutCard'
import { Flex, Heading, Box, useBreakpointValue } from '@chakra-ui/react'
import useMobileCheck from '../hooks/useMobileCheck'
import { coaches } from './utils'
import useMidSizeCheck from '../hooks/useMidSizeCheck'
import { Fade } from 'react-awesome-reveal'
import { Slide } from 'react-awesome-reveal'

const AboutPageContainer = () => {
  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()
  const aboutPageHeroImg = '/aboutPageHero.svg'

  const containerHeight = useBreakpointValue({
    base: '2300px', // Height for mobile screens
    md: '3100px', // Height for medium-sized screens
    lg: '900px', // Height for large-sized screens
  })

  return (
    <Box
      mt="10"
      style={
        isMobile
          ? undefined
          : {
              backgroundImage: `url(${aboutPageHeroImg})`,
              backgroundSize: 'cover',
            }
      }
    >
      <Slide direction="down" triggerOnce={true} fraction={0}>
        <Heading fontSize="5xl" textAlign="center" mt="15">
          Meet Your Coaches
        </Heading>
      </Slide>

      <Flex
        h={containerHeight}
        justify="space-between"
        alignItems="center"
        direction={isMidSized ? 'column' : 'row'}
      >
        {coaches.map((coach, index) => (
          <Fade key={index} duration={2000} triggerOnce={true}>
            <AboutCard key={index} {...coach} />
          </Fade>
        ))}
      </Flex>
    </Box>
  )
}

export default AboutPageContainer
