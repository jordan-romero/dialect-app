import React from 'react'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import AboutCard from './AboutCard'
import { coaches } from './utils'
import { motion } from 'framer-motion'
import {
  EASE,
  fadeUp,
  FloatingGlyphs,
  stagger,
} from '../PrelaunchHomePage/motion'

const AboutPageContainer = () => {
  return (
    <Box bg="white">
      {/* Hero */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient="linear(to-br, #F5F2FF 0%, #ECEBFF 45%, #E6F6FB 100%)"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: { base: '400px', md: '600px' },
          height: { base: '400px', md: '600px' },
          bg: 'radial-gradient(closest-side, rgba(114,63,197,0.22), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: { base: '400px', md: '500px' },
          height: { base: '400px', md: '500px' },
          bg: 'radial-gradient(closest-side, rgba(126,172,226,0.28), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      >
        <FloatingGlyphs layout="center" />
        <Container
          maxW="4xl"
          position="relative"
          zIndex={1}
          px={{ base: 5, md: 8 }}
          py={{ base: 16, md: 24 }}
          textAlign="center"
        >
          <Stack
            spacing={5}
            as={motion.div}
            variants={stagger(0.12, 0.1)}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="brand.purple"
                letterSpacing="0.14em"
                textTransform="uppercase"
              >
                Meet the coaches
              </Text>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '6xl' }}
                fontWeight="black"
                letterSpacing="-0.02em"
                lineHeight="1.05"
                color="gray.900"
                sx={{ textWrap: 'balance' }}
              >
                Trained ears.{' '}
                <Box
                  as="span"
                  bgGradient="linear(to-r, brand.purple, brand.iris, brand.blue, brand.purple)"
                  bgClip="text"
                  bgSize="300% 100%"
                  sx={{
                    animation: 'aa-shimmer 8s ease-in-out infinite',
                    '@keyframes aa-shimmer': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  Working actors.
                </Box>
              </Heading>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.600"
                maxW="640px"
                mx="auto"
                lineHeight="1.7"
                sx={{ textWrap: 'balance' }}
              >
                The coaches behind ActingAccents.com teach the systematic,
                IPA-based approach they use every day in professional theatre,
                film, and television — and in the classroom.
              </Text>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* Coaches */}
      <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 16, md: 24 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 10 }}>
          {coaches.map((coach, i) => (
            <motion.div
              key={coach.name}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.15 }}
              style={{ height: '100%' }}
            >
              <AboutCard {...coach} />
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default AboutPageContainer
