import React from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  FaEnvelope,
  FaMicrophoneAlt,
  FaRegLightbulb,
} from 'react-icons/fa'
import ContactPageFormContainer from './ContactPageForm/ContactPageFormContainer'

const perks = [
  {
    icon: FaRegLightbulb,
    title: 'Course updates',
    body: 'Hear first when new lessons, tools, and exercises go live.',
  },
  {
    icon: FaMicrophoneAlt,
    title: 'Dialect tips',
    body: 'Occasional notes from the coaches on what’s working in the studio.',
  },
  {
    icon: FaEnvelope,
    title: 'Direct line',
    body: 'Reply to any email — a real coach reads it.',
  },
]

const ContactPageContainer = () => {
  return (
    <Box bg="white">
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
        <Container
          maxW="7xl"
          position="relative"
          zIndex={1}
          px={{ base: 5, md: 8 }}
          py={{ base: 16, md: 24 }}
        >
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 10, lg: 16 }}
            alignItems="center"
          >
            <GridItem>
              <Stack spacing={6} maxW="520px">
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="brand.purple"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                >
                  Get in touch
                </Text>
                <Heading
                  as="h1"
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  fontWeight="black"
                  letterSpacing="-0.02em"
                  lineHeight="1.05"
                  color="gray.900"
                >
                  Questions, ideas, or ready to{' '}
                  <Box
                    as="span"
                    bgGradient="linear(to-r, brand.purple, brand.iris)"
                    bgClip="text"
                  >
                    join the list?
                  </Box>
                </Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600" lineHeight="1.7">
                  Drop your details and we’ll keep you posted on launch,
                  lessons, and early-access perks. Prefer email?{' '}
                  <Box
                    as="a"
                    href="mailto:info@actingaccents.com"
                    color="brand.purple"
                    fontWeight="semibold"
                    _hover={{ color: 'brand.purpleLight' }}
                  >
                    info@actingaccents.com
                  </Box>
                </Text>

                <Stack spacing={4} pt={2}>
                  {perks.map((perk) => (
                    <HStack key={perk.title} align="flex-start" spacing={4}>
                      <Box
                        w="42px"
                        h="42px"
                        flexShrink={0}
                        borderRadius="xl"
                        bgGradient="linear(to-br, brand.purple, brand.iris)"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 8px 18px -8px rgba(114,63,197,0.5)"
                      >
                        <Icon as={perk.icon} boxSize={4} />
                      </Box>
                      <Stack spacing={0.5}>
                        <Text fontWeight="bold" color="gray.900">
                          {perk.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {perk.body}
                        </Text>
                      </Stack>
                    </HStack>
                  ))}
                </Stack>
              </Stack>
            </GridItem>

            <GridItem>
              <ContactPageFormContainer />
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default ContactPageContainer
