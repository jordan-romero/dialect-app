import React from 'react'
import AboutCard from './AboutCard'
import { Flex, Heading, Box } from '@chakra-ui/react'
import useMobileCheck from '../hooks/useMobileCheck'
import { coaches } from './utils'

const AboutPageContainer = () => {
  const isMobile = useMobileCheck()
  const aboutPageHeroImg = '/aboutPageHero.svg'

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
      <Heading fontSize="5xl" textAlign="center" mt="15">
        Meet Your Coaches
      </Heading>
      <Flex
        h="1300px"
        justify="space-between"
        alignItems="center"
        direction={isMobile ? 'column' : 'row'}
      >
        {coaches.map((coach, index) => (
          <AboutCard key={index} {...coach} />
        ))}
      </Flex>
    </Box>
  )
}

export default AboutPageContainer
