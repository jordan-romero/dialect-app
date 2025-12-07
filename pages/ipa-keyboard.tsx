import React from 'react'
import { Box, Container, VStack, Text, Link as ChakraLink, Divider } from '@chakra-ui/react'
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
        <meta name="keywords" content="IPA keyboard, phonetic alphabet, IPA transcription, acting, accents, dialects" />
        <meta property="og:title" content="Free IPA Keyboard | Acting Accents" />
        <meta property="og:description" content="Free online IPA keyboard with rich text formatting and T9-style shortcuts" />
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
                This free IPA (International Phonetic Alphabet) keyboard is designed specifically
                for actors, linguists, and language learners who need to create accurate phonetic
                transcriptions with professional formatting.
              </Text>

              <Text fontSize="md" fontWeight="semibold" mb={2} color="gray.800">
                Features:
              </Text>
              <VStack align="start" spacing={2} pl={4} mb={4}>
                <Text fontSize="sm" color="gray.700">
                  ✓ Complete IPA symbol library organized alphabetically
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ Rich text formatting (Bold, Italic, Underline, Superscript, Subscript)
                </Text>
                <Text fontSize="sm" color="gray.700">
                  ✓ T9-style keyboard shortcuts (Ctrl+A cycles through A symbols)
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
                <Text fontSize="sm" color="gray.700" fontWeight="semibold" mt={1}>
                  IPA Symbols (Ctrl only):
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">Ctrl+[Letter]</Text> - Cycle through symbols (e.g., Ctrl+A for a, ɑ, æ, etc.)
                </Text>

                <Text fontSize="sm" color="gray.700" fontWeight="semibold" mt={2}>
                  Text Formatting (Ctrl+Shift):
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">Ctrl+Shift+B</Text> - Bold
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">Ctrl+Shift+I</Text> - Italic
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">Ctrl+Shift+U</Text> - Underline
                </Text>

                <Text fontSize="sm" color="gray.700" fontWeight="semibold" mt={2}>
                  History (Ctrl+Shift):
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">Ctrl+Shift+Z</Text> - Undo
                </Text>
                <Text fontSize="sm" color="gray.700" pl={2}>
                  <Text as="span" fontWeight="semibold">Ctrl+Shift+Y</Text> - Redo
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

