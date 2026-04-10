import React from 'react'
import {
  Box,
  Container,
  VStack,
  Text,
  Link as ChakraLink,
  Divider,
} from '@chakra-ui/react'
import Head from 'next/head'
import { IPAKeyboardWithRichText } from '../components/Community/IPAKeyboardWithRichText'

/**
 * Standalone IPA Keyboard Page
 *
 * Public-facing page that anyone can access to use the IPA keyboard.
 * No authentication required.
 */
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

      <Box minH="100vh" bg="gray.50">
        {/* Main Content */}
        <Container maxW="1200px" py={8}>
          <IPAKeyboardWithRichText />

          {/* Additional Info Section */}
          <VStack spacing={4} mt={8} align="stretch">
            <Divider />

            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <Text fontSize="lg" fontWeight="bold" mb={3} color="brand.iris">
                About This Tool
              </Text>
              <Text fontSize="md" color="gray.700" mb={4}>
                This free IPA (International Phonetic Alphabet) keyboard is
                designed specifically for actors, linguists, and language
                learners who need to create accurate phonetic transcriptions
                with professional formatting.
              </Text>

              <Text fontSize="md" fontWeight="semibold" mb={2} color="gray.800">
                Features:
              </Text>
              <VStack align="start" spacing={2} pl={4} mb={4}>
                <Text fontSize="sm" color="gray.700">
                  ✓ Complete IPA symbol library organized alphabetically
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ Rich text formatting (Bold, Italic, Underline, Superscript,
                  Subscript)
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ T9-style shortcuts: Ctrl+letter (press repeatedly within 1s
                  to cycle symbols for that letter)
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ Copy to clipboard functionality
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ Undo/Redo history
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ Diacritics, tones, and suprasegmentals
                </Text>
              </VStack>

              <Text fontSize="md" fontWeight="semibold" mb={2} color="gray.800">
                Keyboard Shortcuts:
              </Text>
              <VStack align="start" spacing={1} pl={4} mb={4}>
                <Text
                  fontSize="sm"
                  color="gray.700"
                  fontWeight="semibold"
                  mt={1}
                >
                  IPA symbols:
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Ctrl+[Letter]
                  </Text>{' '}
                  — press again within a second to cycle (e.g. a, ɑ, æ for A)
                </Text>

                <Text
                  fontSize="sm"
                  color="gray.700"
                  fontWeight="semibold"
                  mt={2}
                >
                  Diacritics (direct access):
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Shift+Alt+O
                  </Text>{' '}
                  — voiceless (̥), <Text as="span" fontWeight="semibold">Shift+Alt+OO</Text> — voiceless above (̊)
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Shift+Alt+D
                  </Text>{' '}
                  — dental (̪), <Text as="span" fontWeight="semibold">Alt+F</Text> — tie bar (͡)
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Alt+.
                  </Text>{' '}
                  — extra-short (̆), <Text as="span" fontWeight="semibold">Alt+..</Text> — long (ː)
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  Hover over any symbol to see its specific shortcut
                </Text>

                <Text
                  fontSize="sm"
                  color="gray.700"
                  fontWeight="semibold"
                  mt={2}
                >
                  Text Formatting:
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Ctrl+B
                  </Text>{' '}
                  (Cmd+B on Mac) - Bold
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Ctrl+I
                  </Text>{' '}
                  (Cmd+I on Mac) - Italic
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Ctrl+U
                  </Text>{' '}
                  (Cmd+U on Mac) - Underline
                </Text>

                <Text
                  fontSize="sm"
                  color="gray.700"
                  fontWeight="semibold"
                  mt={2}
                >
                  History:
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Ctrl+Z
                  </Text>{' '}
                  (Cmd+Z on Mac) - Undo
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">
                    Ctrl+Y
                  </Text>{' '}
                  (Windows) or{' '}
                  <Text as="span" fontWeight="semibold">
                    Cmd+Shift+Z
                  </Text>{' '}
                  (Mac) — Redo
                </Text>
              </VStack>

              <Text fontSize="md" color="gray.700" mb={4}>
                Want to learn more about dialect training and accent coaching?{' '}
                <ChakraLink href="/" color="brand.iris" fontWeight="semibold">
                  Visit Acting Accents
                </ChakraLink>
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default IPAKeyboardPage
