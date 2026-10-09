import React from 'react'
import { Text } from '@chakra-ui/react'

// IPA Extensions, spacing modifier letters, combining diacritics and the
// phonetic-extension blocks. Arimo (the body font) lacks most of these, so the
// browser borrows them from a system font and the marks land off-centre —
// breves drift right of ʊ ɪ ɚ, tie bars detach. Charis SIL positions them.
const IPA_CHAR = '[\\u0250-\\u036F\\u1D00-\\u1DBF]'

// A transcription between / / or [ ], or any other word holding IPA, is set in
// the IPA font as a whole so its marks and letters share one font's metrics.
const IPA_SEGMENT = new RegExp(
  `(\\/[^/\\n]*${IPA_CHAR}[^/\\n]*\\/|\\[[^\\]\\n]*${IPA_CHAR}[^\\]\\n]*\\]|[^\\s/\\[\\]]*${IPA_CHAR}[^\\s/\\[\\]]*)`,
  'g',
)
const HAS_IPA = new RegExp(IPA_CHAR)

const underline = (text: string): React.ReactNode => {
  if (!text.includes('{')) return text
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
 * IPA inside the text is also set in the IPA font (see IPA_SEGMENT).
 */
export const renderUnderlined = (text: string): React.ReactNode => {
  if (!text) return text
  if (!HAS_IPA.test(text)) return underline(text)

  // Odd indexes are the captured IPA segments.
  return text.split(IPA_SEGMENT).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="ipa-text">
        {underline(part)}
      </span>
    ) : (
      <React.Fragment key={i}>{underline(part)}</React.Fragment>
    ),
  )
}

/** Component form, for when JSX reads better than a call. */
const UnderlineMarkup: React.FC<{ text: string }> = ({ text }) => (
  <>{renderUnderlined(text)}</>
)

export default UnderlineMarkup
