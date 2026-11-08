import React from 'react'
import {
  Box,
  Container,
  VStack,
  Text,
  Link as ChakraLink,
  SimpleGrid,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { EASE, Reveal } from '../components/PrelaunchHomePage/motion'
import Head from 'next/head'
import { IPAKeyboardWithRichText } from '../components/Community/IPAKeyboardWithRichText'

/**
 * Standalone IPA Keyboard Page
 *
 * Public-facing page that anyone can access to use the IPA keyboard.
 * No authentication required.
 */
const FEATURES = [
  'Complete IPA symbol library organized alphabetically',
  'Rich text formatting (Bold, Italic, Underline, Superscript, Subscript)',
  'T9-style shortcuts: Option (Mac) / Alt (Windows) + letter (press repeatedly to cycle symbols for that letter)',
  'Copy to clipboard functionality',
  'Undo/Redo history',
  'Diacritics, tones, and suprasegmentals',
]

const IPAKeyboardPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Free IPA Keyboard | Acting Accents</title>
        <meta
          name="description"
          content="Free online IPA (International Phonetic Alphabet) keyboard with rich text formatting. Create beautifully formatted IPA transcriptions with T9-style shortcuts."
        />
        <meta
          name="keywords"
          content="IPA keyboard, phonetic alphabet, IPA transcription, acting, accents, dialects"
        />
        <meta
          property="og:title"
          content="Free IPA Keyboard | Acting Accents"
        />
        <meta
          property="og:description"
          content="Free online IPA keyboard with rich text formatting and T9-style shortcuts"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box
        minH="100vh"
        bgGradient="linear(to-b, #F5F2FF 0%, #F7F8FC 30%, gray.50 100%)"
      >
        {/* Main Content */}
        <Container maxW="1200px" py={8}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <IPAKeyboardWithRichText />
          </motion.div>

          {/* Additional Info Section */}
          <VStack spacing={4} mt={10} align="stretch">
            <Reveal>
              <Box
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="gray.100"
                boxShadow="0 1px 2px rgba(17,24,39,0.04), 0 20px 48px -28px rgba(30,20,70,0.2)"
              >
                <Text fontSize="lg" fontWeight="bold" mb={3} color="brand.iris">
                  About This Tool
                </Text>
                <Text fontSize="md" color="gray.700" mb={4}>
                  This free IPA (International Phonetic Alphabet) keyboard is
                  designed specifically for actors, linguists, and language
                  learners who need to create accurate phonetic transcriptions
                  with professional formatting.
                </Text>

                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  mb={2}
                  color="gray.800"
                >
                  Features:
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={6}>
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        ease: EASE,
                        delay: i * 0.06,
                      }}
                    >
                      <Flex
                        gap={3}
                        align="flex-start"
                        p={3.5}
                        h="100%"
                        borderRadius="xl"
                        bg="#FAF8FF"
                        borderWidth="1px"
                        borderColor="purple.50"
                      >
                        <Flex
                          flexShrink={0}
                          w="22px"
                          h="22px"
                          mt="1px"
                          borderRadius="full"
                          bgGradient="linear(to-br, brand.purple, brand.iris)"
                          color="white"
                          align="center"
                          justify="center"
                        >
                          <Icon as={CheckIcon} boxSize={2.5} />
                        </Flex>
                        <Text fontSize="sm" color="gray.700" lineHeight="1.55">
                          {f}
                        </Text>
                      </Flex>
                    </motion.div>
                  ))}
                </SimpleGrid>

                <Text fontSize="sm" color="gray.600" mb={4}>
                  Need the full shortcut reference (symbol cycling, diacritics,
                  formatting, and history)? Click{' '}
                  <Text as="span" fontWeight="semibold" color="brand.iris">
                    Instructions
                  </Text>{' '}
                  on the keyboard above to open the side panel any time.
                </Text>

                <Text fontSize="md" color="gray.700" mb={4}>
                  Want to learn more about dialect training and accent coaching?{' '}
                  <ChakraLink href="/" color="brand.iris" fontWeight="semibold">
                    Visit Acting Accents
                  </ChakraLink>
                </Text>
              </Box>
            </Reveal>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default IPAKeyboardPage
