import React from 'react'
import AboutCard from './AboutCard'
import { Flex, Heading } from '@chakra-ui/react'
import useMobileCheck from '../hooks/useMobileCheck'
import { coaches } from './utils'

const AboutPageContainer = () => {
  const isMobile = useMobileCheck()
  const aboutPageHeroImg = '/aboutPageHero.png'

  return (
    <>
      <Heading fontSize="5xl">Meet Your Coaches</Heading>
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
    </>
  )
}

export default AboutPageContainer
