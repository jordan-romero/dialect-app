import React from 'react'
import { VStack } from '@chakra-ui/react'
import { IPAKeyboard } from './IPAKeyboard'

/**
 * IPA Keyboard with Rich Text Editor
 *
 * This component combines the IPA keyboard with a beautiful rich text editor
 * that supports formatting like bold, italic, underline, subscript, superscript, etc.
 */
export const IPAKeyboardWithRichText: React.FC = () => {
  return (
    <VStack spacing={3} align="stretch" maxW="1000px" mx="auto" p={2}>
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
