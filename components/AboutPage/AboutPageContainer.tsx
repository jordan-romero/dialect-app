import React from 'react'
import AboutCard from './AboutCard'
import { Flex, Heading, Box } from '@chakra-ui/react'
import useMobileCheck from '../hooks/useMobileCheck'
import { coaches } from './utils'

const AboutPageContainer = () => {
  const isMobile = useMobileCheck()
  const aboutPageHeroImg = '/aboutPageHero.png'

  return (
    <Box mt="10">
      <Heading fontSize="5xl" textAlign="center" mt="15">
        Meet Your Coaches
      </Heading>
      <Flex
        h="900px"
        justify="space-between"
        alignItems="center"
        style={
          isMobile
            ? undefined
            : {
                backgroundImage: `url(${aboutPageHeroImg})`,
                backgroundSize: 'cover',
              }
        }
      >
        {coaches.map((coach, index) => (
          <AboutCard key={index} {...coach} />
        ))}
      </Flex>
    </Box>
  )
}

export default AboutPageContainer
