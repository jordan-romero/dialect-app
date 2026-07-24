/** True when the OS is Apple (Mac, iPhone, iPad). Safe for SSR (false when no navigator). */
export const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPod|iPad/i.test(navigator.platform ?? '')

/** Modifier name for IPA T9-style shortcuts (Option on Mac, Alt on Windows/Linux). */
export const ipaModifierLabel = (): string =>
  isApplePlatform() ? 'Option' : 'Alt'

/** e.g. "Option+A" on Mac, "Alt+A" elsewhere */
export const ipaShortcutKey = (letter: string): string =>
  `${ipaModifierLabel()}+${
    letter.length === 1 ? letter.toUpperCase() : letter
  }`

/**
 * T9 cycle shortcut shown as the repeated key, e.g. the 1st/2nd/3rd symbol in
 * group "A" → "Option+A" / "Option+AA" / "Option+AAA" (Alt on Windows).
 * Multi-character group labels (e.g. "Diacritics") can't be repeated
 * meaningfully, so those fall back to a count.
 */
export const ipaShortcutKeyRepeated = (
  letter: string,
  count: number,
): string => {
  const mod = ipaModifierLabel()
  const key = letter.toLowerCase()
  const n = Math.max(1, count)
  if (key.length !== 1) return `${mod}+${letter}${n > 1 ? ` (${n}×)` : ''}`
  return `${mod}+${key.toUpperCase().repeat(n)}`
}

/**
 * macOS Option+letter is often a dead key (e.g. Option+U → ¨). We cancel keydown in capture,
 * but WebKit may still emit insertText/composition for that character. Call this when handling
 * an IPA Alt/Option shortcut so editors can suppress the stray insert for a few ms.
 */
let ipaAltLetterSuppressUntil = 0

export const notifyIpaAltLetterShortcutHandled = (): void => {
  // Set flag IMMEDIATELY before any async operations so beforeinput sees it
  ipaAltLetterSuppressUntil = Date.now() + 3000
}

export const clearIpaAltLetterSuppression = (): void => {
  ipaAltLetterSuppressUntil = 0
}

const isIpaAltLetterSuppressActive = (): boolean =>
  Date.now() < ipaAltLetterSuppressUntil

/**
 * Code points WebKit often inserts after Option+letter dead keys (E/U/I/N/` etc.).
 * Includes spacing modifiers (¨ ´) and combining forms (̂ ̃) used for Option+I / Option+N.
 */
const MAC_OPTION_DEAD_KEY_CODE_POINTS = new Set<number>([
  0x00a8, // ¨ Option+U
  0x00b4, // ´ Option+E
  0x2019, // ’ right single quote (sometimes used instead of ´)
  0x2018, // ‘ left single quote
  0x0060, // ` grave
  0x02cb, // ˋ modifier letter grave accent
  0x02c6, // ˆ modifier letter circumflex (Option+I)
  0x005e, // ^ ASCII circumflex
  0x02dc, // ˜ small tilde (Option+N)
  0x007e, // ~ tilde
  0x00af, // ¯ macron
  0x02d8, // ˘ breve
  0x02dd, // ˝ double acute
  0x00b8, // ¸ cedilla
  0x0300, // ̀ combining grave (Option+` leak)
  0x0301, // ́ combining acute (Option+E leak on some paths)
  0x0302, // ̂ combining circumflex (Option+I leak)
  0x0303, // ̃ combining tilde (Option+N leak)
  0xff5e, // ～ fullwidth tilde
  0x02c7, // ˇ caron (some layouts)
  0x02c9, // ˉ modifier macron
])

const collectCodePoints = (s: string): number[] => {
  const out: number[] = []
  for (let i = 0; i < s.length; ) {
    const cp = s.codePointAt(i)
    if (cp === undefined) break
    out.push(cp)
    i += cp > 0xffff ? 2 : 1
  }
  return out
}

/** True if this beforeinput insert should be dropped (Mac only; after IPA Option+letter) */
export const shouldSuppressMacOptionDeadKeyBeforeInput = (
  inputType: string,
  data: string | null,
): boolean => {
  if (!isApplePlatform() || !isIpaAltLetterSuppressActive()) return false
  if (
    inputType !== 'insertText' &&
    inputType !== 'insertCompositionText' &&
    inputType !== 'insertReplacementText'
  ) {
    return false
  }
  if (!data) return false
  const cps = collectCodePoints(data)
  if (cps.length === 0 || cps.length > 4) return false
  return cps.every((cp) => MAC_OPTION_DEAD_KEY_CODE_POINTS.has(cp))
}
