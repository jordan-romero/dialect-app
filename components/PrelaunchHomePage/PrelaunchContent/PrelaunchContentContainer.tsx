import React from 'react'
import { Box, Container, Grid, GridItem, Stack } from '@chakra-ui/react'
import PrelaunchMain from './PrelaunchMain'
import PrelaunchCta from './PrelaunchCta'
import DialectVideo from './DialectVideo'
import { motion } from 'framer-motion'
import { EASE } from '../motion'

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
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.75 }}
              >
                <PrelaunchCta />
              </motion.div>
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
