import React from 'react'
import AboutCard from './AboutCard'
import { Flex, Heading, Box, useBreakpointValue } from '@chakra-ui/react'
import useMobileCheck from '../hooks/useMobileCheck'
import { coaches } from './utils'
import useMidSizeCheck from '../hooks/useMidSizeCheck'
import Slide from 'react-reveal/Slide'

const AboutPageContainer = () => {
  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()
  const aboutPageHeroImg = '/aboutPageHero.svg'

  const containerHeight = useBreakpointValue({
    base: '1400px', // Height for mobile screens
    md: '2800px', // Height for medium-sized screens
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
      <Slide top>
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
          <Slide key={index} left>
            <AboutCard key={index} {...coach} />
          </Slide>
        ))}
      </Flex>
    </Box>
  )
}

export default AboutPageContainer
