import {
  Box,
  Card,
  CardHeader,
  Heading,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import React from 'react'
import useMobileCheck from '../../hooks/useMobileCheck'

const PrelaunchPersonas = () => {
  const beneficiaries = [
    'Stage, Film & Television Actors',
    'Secondary Education Teachers',
    'Dialect and Accent Coaches',
    'ESL Speakers Seeking Accent Modification',
    'Language Enthusiasts',
    'Voiceover Artists',
    'Directors',
    'Dramaturgs',
    'Singers',
    'Writers',
  ]
  const isMobile = useMobileCheck()
  const footerHeroMobile = '/footerHeroMobile.png'

  return (
    <Box p={isMobile ? 4 : 10} borderRadius={isMobile ? 6 : undefined}>
      {isMobile ? (
        <Card
          bgImage={`url(${footerHeroMobile})`}
          bgSize="contain"
          bgRepeat="no-repeat"
          bgPosition="bottom"
          w="100%"
          h="440px"
          borderRadius="md"
          boxShadow="lg"
          p={6}
          textAlign="center"
        >
          <Heading fontSize="xl" mt="5" mb="5">
            Who Would Benefit From ActingAccents.com Courses?
          </Heading>
          <Box w="100%">
            <UnorderedList fontWeight="bold" textAlign="left">
              {beneficiaries.map((beneficiary, index) => (
                <ListItem key={index}>{beneficiary}</ListItem>
              ))}
            </UnorderedList>
          </Box>
        </Card>
      ) : (
        <Box bg="brand.lightGreen" w="70%" p={12} borderRadius="100">
          <Heading fontSize="3xl">
            Who Would Benefit From ActingAccents.com Courses?
          </Heading>
          <Box w="55%">
            <UnorderedList pt={5} fontWeight="bold">
              {beneficiaries.map((beneficiary, index) => (
                <ListItem key={index}>{beneficiary}</ListItem>
              ))}
            </UnorderedList>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default PrelaunchPersonas
