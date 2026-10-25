import React from 'react'
import { Text } from '@chakra-ui/react'

/**
 * Renders text with `{...}` marking the underlined span:
 *
 *   "Bri{ng}"      -> Bri<u>ng</u>
 *   "mea{s}ure"    -> mea<u>s</u>ure
 *   "wi{tch}"      -> wi<u>tch</u>
 *
 * Why curly braces: phonetics already claims the obvious delimiters — [ ] is
 * phonetic transcription, / / is phonemic, ⟨ ⟩ is orthographic — so in an IPA
 * course those would be mistaken for content. { } is unused in the notation.
 *
 * This builds React nodes rather than an HTML string, so there's no
 * dangerouslySetInnerHTML and nothing to sanitise. It also splits on the
 * markers rather than on characters, which keeps IPA grapheme clusters
 * (t͡ʃ, ɪ̆) intact — splitting by character would orphan combining marks.
 *
 * Text with no markers passes through unchanged, so this is safe to apply
 * everywhere regardless of whether a given string has been marked up yet.
 */
export const renderUnderlined = (text: string): React.ReactNode => {
  if (!text || !text.includes('{')) return text

  const parts = text.split(/(\{[^{}]*\})/g)
  return parts.map((part, i) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      return (
        <Text as="u" key={i} display="inline">
          {part.slice(1, -1)}
        </Text>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

/** Component form, for when JSX reads better than a call. */
const UnderlineMarkup: React.FC<{ text: string }> = ({ text }) => (
  <>{renderUnderlined(text)}</>
)

export default UnderlineMarkup
