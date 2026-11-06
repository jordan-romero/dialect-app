import React from 'react'
import { Box, Container, Grid, GridItem, Stack } from '@chakra-ui/react'
import PrelaunchMain from './PrelaunchMain'
import PrelaunchCta from './PrelaunchCta'
import DialectVideo from './DialectVideo'

const PrelaunchContent = () => {
  return (
    <Box position="relative" zIndex={1}>
      <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 16, md: 24 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '0.9fr 1.3fr' }}
          gap={{ base: 10, lg: 12 }}
          alignItems="center"
        >
          <GridItem>
            <Stack spacing={8}>
              <PrelaunchMain />
              <PrelaunchCta />
            </Stack>
          </GridItem>
          <GridItem>
            <DialectVideo />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default PrelaunchContent
