import { Box, Card, Heading, ListItem, UnorderedList } from '@chakra-ui/react'
import React from 'react'
import { personasMobile } from './utils'

const PrelaunchPersonas = () => {
  const footerHeroMobile = '/footerHeroMobile.svg'

  return (
    <Box p={4} borderRadius={6}>
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
            {personasMobile.map((persona, index) => (
              <ListItem key={index}>{persona}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      </Card>
    </Box>
  )
}

export default PrelaunchPersonas
