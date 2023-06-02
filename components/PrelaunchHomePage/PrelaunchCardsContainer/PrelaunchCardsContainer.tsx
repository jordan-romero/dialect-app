import { Box, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import React from 'react'
import PrelaunchCard from './PrelaunchCard'
import { FaGraduationCap } from 'react-icons/fa'
import { FaBook } from 'react-icons/fa'
import { FaRegLightbulb } from 'react-icons/fa'
import { CardData } from '../types'
import useMobileCheck from '../../hooks/useMobileCheck'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'

const PrelaunchCardsContainer = () => {
  const cardsData: CardData[] = [
    {
      icon: FaBook,
      header: 'Our Promise',
      body: 'This course will teach actors how to effectively utilize the International Phonetic Alphabet, or IPA, for the study of dialects and accents. Professional dialect coaches overwhelmingly agree that actors with a solid IPA background are quicker studies and perform dialects and accents more authentically. While this course is targeted towards actors, there are many other vocations which can benefit from it.',
      buttonText: 'Learn more About Our Coaches',
    },
    {
      icon: FaGraduationCap,
      header: 'The IPA Advantage',
      body: 'The first instructional video series will be “The Actor’s Guide to IPA and Accents”. In this course you will learn how to read and write in the IPA, how to use the IPA to chart out any dialect or accent you choose, and how to make consistent and compelling choices to enhance your performance. Each lesson will be accompanied by helpful exercises and resources to gauge your progress.',
      buttonText: 'Read our Testimonials',
    },
    {
      icon: FaRegLightbulb,
      header: 'Complete Control',
      body: 'This approach will give you confidence, credibility, and complete control of your own creative process. You’ll find it’s the most efficient method for learning a dialect available to you as an actor. Plus, you will no longer have to rely on mere mimicry to get the job done.',
      buttonText: 'Contact Us for More Info',
    },
    // Add more card data objects as needed
  ]

  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()

  const renderCards = () => {
    if (isMobile) {
      return cardsData.map((cardData, index) => (
        <PrelaunchCard key={index} data={cardData} />
      ))
    } else if (isMidSized) {
      return (
        <Flex ml="10" mr="10" direction="column">
          {cardsData.map((cardData, index) => (
            <PrelaunchCard key={index} data={cardData} />
          ))}
        </Flex>
      )
    } else {
      return (
        <SimpleGrid
          spacing={4}
          templateColumns="repeat(3, minmax(200px, 1fr))"
          ml="10"
          mr="10"
        >
          {cardsData.map((cardData, index) => (
            <PrelaunchCard key={index} data={cardData} />
          ))}
        </SimpleGrid>
      )
    }
  }

  return (
    <Box pt={isMobile ? '1' : '35'} textAlign="center">
      <Heading fontSize={isMobile ? '3xl' : '5xl'}>
        Why use ActingAccents.com?
      </Heading>
      <Box
        pt={isMidSized ? '1' : '40'}
        textAlign={isMobile ? 'center' : 'left'}
      >
        {renderCards()}
      </Box>
    </Box>
  )
}

export default PrelaunchCardsContainer
