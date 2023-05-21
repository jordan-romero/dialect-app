import { Box, Card, CardHeader, Heading, ListItem, UnorderedList } from '@chakra-ui/react'
import React from 'react'

const PrelaunchPersonas = () => {
    const beneficiaries = [
        'Stage, Film & Television Actors',
        'Voiceover Artists',
        'Singers',
        'Writers',
        'Secondary Education Teachers',
        'Directors',
        'Dramaturgs',
        'Dialect and Accent Coaches',
        'ESL Speakers Seeking Accent Modification',
        'Language Enthusiasts',
      ];
  return (
    <Box p='10'>
    <Box bg='brand.lightGreen' w='70%' p='12' borderRadius='100'>
    <Heading w='85%' fontSize='3xl'>Who Would Benefit From ActingAccent.com Courses?</Heading>
    <Box w='55%' >
      <UnorderedList pt='5' fontWeight='bold'>
        {beneficiaries.map((beneficiary, index) => (
          <ListItem key={index}>{beneficiary}</ListItem>
        ))}
      </UnorderedList>
      </Box>
      </Box>
    </Box>
  );
}

export default PrelaunchPersonas