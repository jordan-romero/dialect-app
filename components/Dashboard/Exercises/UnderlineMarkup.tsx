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

  // Odd indexes are the captured IPA segments. One wrapping span keeps the
  // pieces in a single inline run: as direct children of a flex container
  // (Chakra's Button), the spaces between words would collapse away.
  return (
    <span>
      {text.split(IPA_SEGMENT).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="ipa-text">
            {underline(part)}
          </span>
        ) : (
          <React.Fragment key={i}>{underline(part)}</React.Fragment>
        ),
      )}
    </span>
  )
}

type RunStyle = { b: boolean; i: boolean; u: boolean }

/**
 * Prose form of renderUnderlined that also carries the bold and italics Scott
 * sets in the Drive docs:
 *
 *   "**bold**"   "_italic_"   "{underline}"
 *
 * Markers may nest and may sit inside a transcription — the docs bold a single
 * sound mid-word, as in /θə lɛtə**ɹ**ɪmplaɪ̆d/. So the markers are stripped
 * first, and the IPA font is decided on the plain text afterwards; deciding it
 * on the marked-up text would cut a transcription at every marker.
 *
 * A marker with no partner later in the string is left as literal text, so a
 * footnote's "*" or "**" survives. Kept separate from renderUnderlined, which
 * every exercise uses, so `_` and `**` only mean something in prose that was
 * written with them in mind.
 */
export const renderRich = (text: string): React.ReactNode => {
  if (!text) return text

  let plain = ''
  const styles: RunStyle[] = []
  let b = false
  let i = false
  let u = false
  for (let k = 0; k < text.length; ) {
    if (text.startsWith('**', k) && (b || text.indexOf('**', k + 2) !== -1)) {
      b = !b
      k += 2
      continue
    }
    const c = text[k]
    if (c === '_' && (i || text.indexOf('_', k + 1) !== -1)) {
      i = !i
      k++
      continue
    }
    if (c === '{' && !u && text.indexOf('}', k + 1) !== -1) {
      u = true
      k++
      continue
    }
    if (c === '}' && u) {
      u = false
      k++
      continue
    }
    plain += c
    styles.push({ b, i, u })
    k++
  }

  const ipa: boolean[] = new Array(plain.length).fill(false)
  const segment = new RegExp(IPA_SEGMENT.source, 'g')
  let m: RegExpExecArray | null
  while ((m = segment.exec(plain)) !== null) {
    if (!m[0]) {
      segment.lastIndex++
      continue
    }
    for (let k = m.index; k < m.index + m[0].length; k++) ipa[k] = true
  }

  const keyAt = (k: number) =>
    `${+styles[k].b}${+styles[k].i}${+styles[k].u}${+ipa[k]}`
  const nodes: React.ReactNode[] = []
  let start = 0
  for (let k = 1; k <= plain.length; k++) {
    if (k < plain.length && keyAt(k) === keyAt(start)) continue
    const s = styles[start]
    let node: React.ReactNode = plain.slice(start, k)
    if (ipa[start]) node = <span className="ipa-text">{node}</span>
    if (s.u) node = <u>{node}</u>
    if (s.i) node = <em>{node}</em>
    if (s.b) node = <strong>{node}</strong>
    nodes.push(<React.Fragment key={start}>{node}</React.Fragment>)
    start = k
  }
  return <span>{nodes}</span>
}

/** Component form, for when JSX reads better than a call. */
const UnderlineMarkup: React.FC<{ text: string }> = ({ text }) => (
  <>{renderUnderlined(text)}</>
)

export default UnderlineMarkup
