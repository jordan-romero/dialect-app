import React from 'react'
import { VStack, Box, Text } from '@chakra-ui/react'
import { IPAKeyboard } from './IPAKeyboard'

/**
 * IPA Keyboard with Rich Text Editor
 *
 * This component combines the IPA keyboard with a beautiful rich text editor
 * that supports formatting like bold, italic, underline, subscript, superscript, etc.
 */
export const IPAKeyboardWithRichText: React.FC = () => {
  return (
    <VStack spacing={6} align="stretch" maxW="1200px" mx="auto" p={4}>
      <Box textAlign="center">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="brand.iris"
          mb={2}
        >
          IPA Keyboard with Rich Text Editor
        </Text>
        <Text fontSize="md" color="gray.600">
          Create beautifully formatted IPA transcriptions with full text formatting support
        </Text>
      </Box>

      <IPAKeyboard
        useRichTextEditor={true}
        showTextArea={true}
        hideInstructions={false}
        title=""
      />
    </VStack>
  )
}

export default IPAKeyboardWithRichText

