import { ipaModifierLabel, ipaShortcutKeyRepeated } from './ipaKeyboardPlatform'

// IPA symbols organized by Latin letters (matching TypeIt layout). Option/Alt +
// the group's key cycles through every symbol after the plain letter.
export const LETTER_GROUPS = [
  { letter: 'A', symbols: ['a', 'æ', 'ɑ', 'ɐ'] },
  { letter: 'B', symbols: ['b', 'β', 'ɓ'] },
  { letter: 'C', symbols: ['c', 'ç', 'ɕ'] },
  { letter: 'D', symbols: ['d', 'ð', 'ɖ', 'ɗ'] },
  { letter: 'E', symbols: ['e', 'ə', 'ɚ', 'ɞ', 'ɘ'] },
  { letter: 'F', symbols: ['f'] },
  { letter: 'G', symbols: ['g', 'ɠ', 'ɢ', 'ɡ'] },
  { letter: 'H', symbols: ['h', 'ħ', 'ɦ', 'ɥ', 'ʜ', 'ɧ'] },
  { letter: 'I', symbols: ['i', 'ɪ', 'ɨ'] },
  { letter: 'J', symbols: ['j', 'ʝ', 'ɟ', 'ʄ'] },
  { letter: 'K', symbols: ['k'] },
  { letter: 'L', symbols: ['l', 'ɫ', 'ɬ', 'ɭ', 'ʟ', 'ɮ'] },
  { letter: 'M', symbols: ['m', 'ɱ'] },
  { letter: 'N', symbols: ['n', 'ŋ', 'ɲ', 'ɳ', 'ɴ'] },
  { letter: 'O', symbols: ['o', 'ɔ', 'ɒ', 'œ', 'ɵ', 'ø'] },
  { letter: 'P', symbols: ['p', 'ɸ'] },
  { letter: 'Q', symbols: ['q'] },
  { letter: 'R', symbols: ['r', 'ɹ', 'ɾ', 'ɻ', 'ʀ', 'ʁ', 'ɽ'] },
  { letter: 'S', symbols: ['s', 'ʃ', 'ʂ'] },
  { letter: 'T', symbols: ['t', 'θ', 'ʈ'] },
  { letter: 'U', symbols: ['u', 'ʊ', 'ʉ'] },
  { letter: 'V', symbols: ['v', 'ʌ', 'ʋ', 'ⱱ'] },
  { letter: 'W', symbols: ['w', 'ʍ', 'ɯ', 'ɰ'] },
  { letter: 'X', symbols: ['x', 'χ'] },
  { letter: 'Y', symbols: ['y', 'ɣ', 'ʏ', 'ʎ', 'ɤ'] },
  { letter: 'Z', symbols: ['z', 'ʒ', 'ʐ', 'ʑ'] },
  { letter: '2', symbols: ['ʔ', 'ʕ', 'ʡ', 'ʢ'] },
  { letter: '3', symbols: ['ɛ', 'ɜ', 'ɝ'] },
  // Additional symbol groups
  {
    letter: 'Diacritics',
    symbols: [
      '̥',
      '̊',
      '̤',
      '̰',
      '̪',
      '̺',
      '̻',
      '̼',
      '̹',
      '̜',
      '̟',
      '̠',
      '̈',
      '̽',
      '̩',
      '̯',
      '˞',
      '̚',
      '̃',
      'ʰ',
      'ʷ',
      'ʲ',
      'ˠ',
      'ˤ',
      '̴',
      '̝',
      '̞',
      '̘',
      '̙',
    ],
  },
  {
    letter: 'Suprasegmentals',
    symbols: ['ˈ', 'ˌ', '̆', 'ː', 'ˑ', '‿', '͡', '|', '‖'],
  },
  {
    letter: 'Tones',
    symbols: [
      '˥',
      '˦',
      '˧',
      '˨',
      '˩',
      '꜈',
      '꜉',
      '꜊',
      '꜋',
      '꜌',
      '꜍',
      '꜎',
      '꜏',
      '꜐',
      '꜑',
      '꜒',
      '↗',
      '↘',
    ],
  },
]

export type LetterGroup = (typeof LETTER_GROUPS)[number]

/**
 * A plain letter (for example, A → a) is entered directly from the keyboard,
 * so it intentionally has no IPA Alt/Option shortcut. The remaining symbols
 * in that group begin the Alt/Option cycle at one press.
 */
export const getShortcutSymbols = (group: LetterGroup): string[] => {
  if (group.letter.length !== 1) return []
  return group.symbols[0] === group.letter.toLowerCase()
    ? group.symbols.slice(1)
    : group.symbols
}

/** T9 group for an Option/Alt+key press. Always the full group, so the
 *  shortcut a tooltip shows works the same in every bank, filtered or not. */
export const findShortcutGroup = (key: string): LetterGroup | undefined =>
  LETTER_GROUPS.find(
    (group) => group.letter.length === 1 && group.letter.toLowerCase() === key,
  )

// Direct keyboard shortcuts for diacritics, suprasegmentals, stress and tones.
// Repeated keys are deliberately kept as sequences (rather than T9 cycles) to
// mirror the printable hotkey reference.
export const DIRECT_SHORTCUTS: { [key: string]: string } = {
  // Shift+Alt combinations
  'shift+alt+o': '̥', // voiceless
  'shift+alt+oo': '̊', // voiceless above (double o)
  'shift+alt+..': '̤', // breathy voiced (double period)
  'shift+alt+sss': '̰', // creaky voiced
  'shift+alt+d': '̪', // dental
  'shift+alt+dd': '̺', // apical (double d)
  'shift+alt+ooo': '̻', // laminal (triple o)
  'shift+alt+m': '̼', // linguolabial
  'shift+alt+,': '̹', // more rounded
  'shift+alt+,,': '̜', // less rounded (double comma)
  'shift+alt+ArrowLeft': '̟', // advanced
  'shift+alt+ArrowRight': '̠', // retracted
  'shift+alt+.': '̈', // centralized
  'shift+alt+x': '̽', // mid-centralized
  'shift+alt+i': '̩', // syllabic
  'shift+alt+c': '̯', // non-syllabic
  'shift+alt+r': '˞', // rhoticity
  'shift+alt+l': '̚', // no audible release
  'shift+alt+s': '̃', // nasalized
  'shift+alt+h': 'ʰ', // aspirated
  'shift+alt+w': 'ʷ', // labialized
  'shift+alt+j': 'ʲ', // palatalized
  'shift+alt+y': 'ˠ', // velarized
  'shift+alt+2': 'ˤ', // pharyngealized
  'shift+alt+ss': '̴', // velarized/pharyngealized (double s)
  'shift+alt+ArrowUp': '̝', // raised
  'shift+alt+ArrowDown': '̞', // lowered
  'shift+alt+ArrowLeftArrowLeft': '̘', // advanced tongue root
  'shift+alt+ArrowRightArrowRight': '̙', // retracted tongue root

  // Alt combinations
  'alt+f': '‿', // linking (absence of break)
  'alt+ff': '͡', // tie bar above
  'alt+1': '|', // minor group
  'alt+11': '‖', // major group (double 1)
  'alt+ArrowLeft': '̟', // advanced
  'alt+ArrowRight': '̠', // retracted
  'alt+.': 'ː', // long
  'alt+..': '̆', // extra-short (double period)
  'alt+...': 'ˑ', // half-long (triple period)

  // Stress — the tick sits high like an apostrophe, low like a comma
  "alt+'": 'ˈ', // primary stress
  'alt+,': 'ˌ', // secondary stress

  // Tones — one key per series, pressed 1–5 times from highest to lowest
  'alt+6': '˥',
  'alt+66': '˦',
  'alt+666': '˧',
  'alt+6666': '˨',
  'alt+66666': '˩',
  'alt+7': '꜈',
  'alt+77': '꜉',
  'alt+777': '꜊',
  'alt+7777': '꜋',
  'alt+77777': '꜌',
  'alt+8': '꜍',
  'alt+88': '꜎',
  'alt+888': '꜏',
  'alt+8888': '꜐',
  'alt+88888': '꜑',
  'alt+9': '꜒',
  'alt+ArrowUp': '↗', // global rise
  'alt+ArrowDown': '↘', // global fall
}

const CODE_TOKENS: { [key: string]: string } = {
  Period: '.',
  Comma: ',',
  Quote: "'",
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
}

/** Physical key for a shortcut press. Uses `code`, not `key`, because
 *  Option+letter on a Mac produces a different character (Option+' → æ). */
export const getDirectShortcutToken = (event: KeyboardEvent): string | null => {
  const { code, key } = event

  if (code.startsWith('Key')) return code.substring(3).toLowerCase()
  if (code.startsWith('Digit')) return code.substring(5)
  if (CODE_TOKENS[code]) return CODE_TOKENS[code]
  return key.length === 1 ? key.toLowerCase() : null
}

export const isDirectShortcutPrefix = (prefix: string, keys: string): boolean =>
  Object.keys(DIRECT_SHORTCUTS).some(
    (shortcut) =>
      shortcut.startsWith(`${prefix}${keys}`) &&
      shortcut !== `${prefix}${keys}`,
  )

const ARROW_LABELS: { [key: string]: string } = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
}

/** "shift+alt+ArrowLeftArrowLeft" → "Shift+Option+←←" on Mac, "Shift+Alt+←←" elsewhere */
export const formatDirectShortcut = (shortcut: string): string => {
  const shift = shortcut.startsWith('shift+')
  const keys = shortcut.replace(/^(shift\+)?alt\+/, '')
  const keyLabel = (keys.match(/Arrow(?:Up|Down|Left|Right)|./g) ?? [])
    .map((k) => ARROW_LABELS[k] ?? k.toUpperCase())
    .join('')
  return `${shift ? 'Shift+' : ''}${ipaModifierLabel()}+${keyLabel}`
}

// Characters typed straight from the keyboard with no modifier
const PLAIN_KEYS = /^[a-z.\-]$/

const getSingleShortcut = (symbol: string): string | null => {
  for (const [shortcut, sym] of Object.entries(DIRECT_SHORTCUTS)) {
    if (sym === symbol) return formatDirectShortcut(shortcut)
  }

  for (const group of LETTER_GROUPS) {
    const symbolIndex = getShortcutSymbols(group).indexOf(symbol)
    if (symbolIndex !== -1) {
      return ipaShortcutKeyRepeated(group.letter, symbolIndex + 1)
    }
  }

  if (PLAIN_KEYS.test(symbol)) return symbol.toUpperCase()
  return null
}

/**
 * Keyboard shortcut for any symbol on the keyboard. Single symbols have a
 * direct or T9 shortcut (or are a plain key); multi-character symbols such as
 * diphthongs, affricates and precomposed letters are spelled out as the
 * sequence of shortcuts that types them, e.g. "eɪ̆" → "E, Option+I, Option+..".
 */
export const getSymbolShortcut = (symbol: string): string | null => {
  const single = getSingleShortcut(symbol)
  if (single) return single

  const parts = Array.from(symbol.normalize('NFD'))
  if (parts.length < 2) return null
  const steps = parts.map(getSingleShortcut)
  return steps.every(Boolean) ? steps.join(', ') : null
}
