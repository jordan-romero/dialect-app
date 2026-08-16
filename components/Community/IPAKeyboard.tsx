import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Textarea,
  useToast,
  Tooltip,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  InputGroup,
  InputRightElement,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
} from '@chakra-ui/react'
import { CopyIcon, CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons'
import RichTextIPAEditor from './RichTextIPAEditor'
import {
  isApplePlatform,
  ipaShortcutKey,
  ipaShortcutKeyRepeated,
  notifyIpaAltLetterShortcutHandled,
  shouldSuppressMacOptionDeadKeyBeforeInput,
} from './ipaKeyboardPlatform'

interface IPAKeyboardProps {
  onSymbolClick?: (symbol: string) => void
  onSymbolPreview?: (symbol: string) => void
  showTextArea?: boolean
  compact?: boolean
  filterCategories?: (
    | 'vowels'
    | 'consonants'
    | 'diphthongs'
    | 'triphthongs'
    | 'diacritics'
    | 'stress'
    | 'tones'
    | 'all'
  )[]
  customSymbols?: string[]
  symbolBankCategories?: {
    consonants?: string[]
    monophthongs?: string[]
    diphthongs?: string[]
    triphthongs?: string[]
    diacritics?: string[]
  }
  autoDetectCategory?: boolean
  hideInstructions?: boolean
  title?: string
  showCategoriesInCompact?: boolean
  useRichTextEditor?: boolean
  editorRef?: React.RefObject<any>
  /** When false, symbol bank does not remember or highlight previously clicked symbols (e.g. for quizzes). Default true. */
  persistClickedSymbols?: boolean
}

// Symbol names for tooltips
const SYMBOL_NAMES: { [key: string]: string } = {
  // Vowels
  i: 'close front unrounded vowel',
  ɪ: 'near-close front unrounded vowel',
  ɛ: 'open-mid front unrounded vowel',
  æ: 'near-open front unrounded vowel',
  ɑ: 'open back unrounded vowel',
  ʌ: 'open-mid back unrounded vowel',
  ʊ: 'near-close back rounded vowel',
  u: 'close back rounded vowel',
  ə: 'mid central vowel (schwa)',
  ɚ: 'r-colored schwa',
  ɝ: 'r-colored mid-central vowel',
  e: 'close-mid front unrounded vowel',
  o: 'close-mid back rounded vowel',
  ɔ: 'open-mid back rounded vowel',
  ɨ: 'close central unrounded vowel',
  ʏ: 'near-close front rounded vowel',
  ɤ: 'close-mid back unrounded vowel',
  ø: 'close-mid front rounded vowel',
  œ: 'open-mid front rounded vowel',
  ɵ: 'close-mid central rounded vowel',
  y: 'close front rounded vowel',
  ɐ: 'near-open central vowel',
  a: 'open front unrounded vowel',

  // Consonants
  p: 'voiceless bilabial plosive',
  b: 'voiced bilabial plosive',
  m: 'bilabial nasal',
  f: 'voiceless labiodental fricative',
  v: 'voiced labiodental fricative',
  t: 'voiceless alveolar plosive',
  d: 'voiced alveolar plosive',
  n: 'alveolar nasal',
  ɾ: 'alveolar tap',
  θ: 'voiceless dental fricative',
  ð: 'voiced dental fricative',
  s: 'voiceless alveolar fricative',
  z: 'voiced alveolar fricative',
  ʃ: 'voiceless postalveolar fricative',
  ʒ: 'voiced postalveolar fricative',
  ɹ: 'alveolar approximant',
  l: 'alveolar lateral approximant',
  j: 'palatal approximant',
  k: 'voiceless velar plosive',
  ŋ: 'velar nasal',
  ʔ: 'glottal stop',
  h: 'voiceless glottal fricative',
  ç: 'voiceless palatal fricative',
  w: 'labial-velar approximant',
  t͡ʃ: 'voiceless postalveolar affricate',
  tʃ: 'voiceless postalveolar affricate',
  d͡ʒ: 'voiced postalveolar affricate',
  dʒ: 'voiced postalveolar affricate',
  ɫ: 'velarized alveolar lateral approximant',
  ɡ: 'voiced velar plosive',
  ɣ: 'voiced velar fricative',
  ɠ: 'voiced velar implosive',
  β: 'voiced bilabial fricative',
  ɓ: 'voiced bilabial implosive',
  ɕ: 'voiceless alveolo-palatal fricative',
  ɖ: 'voiced retroflex plosive',
  ɗ: 'voiced alveolar implosive',
  ɟ: 'voiced palatal plosive',
  ʄ: 'voiced palatal implosive',
  ɬ: 'voiceless alveolar lateral fricative',
  ɭ: 'retroflex lateral approximant',
  ʟ: 'velar lateral approximant',
  ɮ: 'voiced alveolar lateral fricative',
  ɱ: 'labiodental nasal',
  ɲ: 'palatal nasal',
  ɳ: 'retroflex nasal',
  ɴ: 'uvular nasal',
  ɸ: 'voiceless bilabial fricative',
  q: 'voiceless uvular plosive',
  ʀ: 'uvular trill',
  ʁ: 'voiced uvular fricative',
  ɻ: 'retroflex approximant',
  ɽ: 'retroflex flap',
  ʂ: 'voiceless retroflex fricative',
  ʈ: 'voiceless retroflex plosive',
  ʋ: 'labiodental approximant',
  ʍ: 'voiceless labial-velar fricative',
  χ: 'voiceless uvular fricative',
  x: 'voiceless velar fricative',
  ʎ: 'palatal lateral approximant',
  ʐ: 'voiced retroflex fricative',
  ʑ: 'voiced alveolo-palatal fricative',
  r: 'alveolar trill',
  c: 'voiceless palatal plosive',
  t͡s: 'voiceless alveolar affricate',
  ts: 'voiceless alveolar affricate',
  d͡z: 'voiced alveolar affricate',
  ɰ: 'velar approximant',
  ɒ: 'open back rounded vowel',
  ɞ: 'open-mid central rounded vowel',
  ɢ: 'voiced uvular plosive',
  ɘ: 'close-mid central unrounded vowel',
  ï: 'centralized close front unrounded vowel',
  ⱱ: 'labiodental flap',

  // Diphthongs
  eɪ: 'FACE vowel',
  eɪ̆: 'FACE vowel',
  aɪ: 'PRICE vowel',
  aɪ̆: 'PRICE vowel',
  ɔɪ: 'CHOICE vowel',
  ɔɪ̆: 'CHOICE vowel',
  aʊ: 'MOUTH vowel',
  aʊ̆: 'MOUTH vowel',
  oʊ: 'GOAT vowel',
  oʊ̆: 'GOAT vowel',
  ju: 'VIEW sequence',
  ɪ̆u: 'VIEW sequence',
  ɪr: 'NEAR vowel',
  ɛr: 'SQUARE vowel',
  ɑr: 'START vowel',
  ɔr: 'NORTH vowel',
  ʊr: 'CURE vowel',
  ɑɚ̆: 'START vowel',
  ɔɚ̆: 'NORTH vowel',
  ɛɚ̆: 'SQUARE vowel',
  ɪɚ̆: 'NEAR vowel',
  ʊɚ̆: 'CURE vowel',

  // Triphthongs
  aɪr: 'FIRE vowel',
  aɪ̆ɚ̆: 'FIRE vowel',
  aʊr: 'HOUR vowel',
  aʊ̆ɚ̆: 'HOUR vowel',
  ɔɪr: 'LAWYER vowel',
  ɔɪ̆ɚ̆: 'LAWYER vowel',
  eɪr: 'PLAYER vowel',
  ɛɪ̆ɚ̆: 'PLAYER vowel',
  oʊr: 'LOWER vowel',
  oʊ̆ɚ̆: 'LOWER vowel',
  aɪ̆ə̆: 'FIRE vowel (alternate)',
  ɪ̆ʊɚ̆: 'triphthong',

  // Diacritics
  '̥': 'voiceless',
  '̊': 'voiceless (above)',
  '̤': 'breathy voiced',
  '̰': 'creaky voiced',
  '̪': 'dental',
  '̺': 'apical',
  '̻': 'laminal',
  '̼': 'linguolabial',
  '̹': 'more rounded',
  '̜': 'less rounded',
  '̟': 'advanced',
  '̠': 'retracted',
  '̈': 'centralized',
  '̽': 'mid-centralized',
  '̩': 'syllabic',
  '̯': 'non-syllabic',
  '˞': 'rhoticity',
  '̚': 'no audible release',
  '̃': 'nasalized',
  ʰ: 'aspirated',
  ʷ: 'labialized',
  ʲ: 'palatalized',
  ˠ: 'velarized',
  ˤ: 'pharyngealized',
  '̴': 'velarized or pharyngealized',
  '̝': 'raised',
  '̞': 'lowered',
  '̘': 'advanced tongue root',
  '̙': 'retracted tongue root',

  // Stress
  ˈ: 'primary stress',
  ˌ: 'secondary stress',

  // Suprasegmentals (includes linking and length)
  '|': 'minor (foot) group',
  '‖': 'major (intonation) group',
  '.': 'syllable break',
  '‿': 'linking (absence of break)',
  '͡': 'tie bar above',
  '-': 'hyphen',
  ː: 'long',
  ˑ: 'half-long',
  '̆': 'extra-short',

  // Tones
  '˥': 'extra high tone',
  '˦': 'high tone',
  '˧': 'mid tone',
  '˨': 'low tone',
  '˩': 'extra low tone',
  '↗': 'global rise',
  '↘': 'global fall',
}

// Helper function to get symbol name
const getSymbolName = (symbol: string): string => {
  return SYMBOL_NAMES[symbol] || symbol
}

// Combining double inverted breve (tie bar) — zero advance width and drawn to the
// left of the pen, so on its own it hangs off the left edge of the key. We nudge
// just this glyph to the right so it renders inside the button.
const TIE_BAR = '͡' // ͡

// Helper to get keyboard shortcut for a symbol
const getSymbolShortcut = (symbol: string): string | null => {
  // First check direct shortcuts
  for (const [shortcut, sym] of Object.entries(DIRECT_SHORTCUTS)) {
    if (sym === symbol) {
      // Format the shortcut nicely for display
      return shortcut
        .replace('shift+alt+', '⇧⌥')
        .replace('alt+', '⌥')
        .replace('ArrowUp', '↑')
        .replace('ArrowDown', '↓')
        .replace('ArrowLeft', '←')
        .replace('ArrowRight', '→')
        .toUpperCase()
    }
  }

  // Then check T9-style cycling shortcuts
  for (const group of LETTER_GROUPS) {
    const symbolIndex = getShortcutSymbols(group).indexOf(symbol)
    if (symbolIndex !== -1) {
      return ipaShortcutKeyRepeated(group.letter, symbolIndex + 1)
    }
  }
  return null
}

// Symbol categories for filtering
const SYMBOL_CATEGORIES = {
  vowels: [
    'i',
    'ɪ',
    'ɛ',
    'æ',
    'ɑ',
    'ʌ',
    'ʊ',
    'u',
    'ə',
    'ɚ',
    'ɝ',
    'e',
    'o',
    'ɔ',
    'ɨ',
    'ʏ',
    'ɤ',
    'ø',
    'œ',
    'ɵ',
    'y',
    'ɐ',
    'ɞ',
    'ɒ',
    'ɘ',
  ],
  consonants: [
    'p',
    'b',
    'm',
    'f',
    'v',
    't',
    'd',
    'n',
    'ɾ',
    'θ',
    'ð',
    's',
    'z',
    'ʃ',
    'ʒ',
    'ɹ',
    'l',
    'j',
    'k',
    'ŋ',
    'ʔ',
    'h',
    'ç',
    'w',
    't͡ʃ',
    'd͡ʒ',
    't͡s',
    'd͡z',
    'ɫ',
    'ɡ',
    'ɣ',
    'ɠ',
    'β',
    'ɓ',
    'ɕ',
    'ɖ',
    'ɗ',
    'ɟ',
    'ʄ',
    'ɬ',
    'ɭ',
    'ʟ',
    'ɮ',
    'ɱ',
    'ɲ',
    'ɳ',
    'ɴ',
    'ɸ',
    'q',
    'ʀ',
    'ʁ',
    'ɻ',
    'ɽ',
    'ʂ',
    'ʈ',
    'ʋ',
    'ʍ',
    'χ',
    'x',
    'ʎ',
    'ʐ',
    'ʑ',
    'r',
    'c',
    'ɰ',
    'ɢ',
    'ⱱ',
  ],
  diphthongs: [
    'eɪ',
    'aɪ',
    'ɔɪ',
    'aʊ',
    'oʊ',
    'ju',
    'ɪr',
    'ɛr',
    'ɑr',
    'ɔr',
    'ʊr',
    'ɪ̆u',
    'oʊ̆',
    'ɑɚ̆',
    'ɛɚ̆',
    'ɪɚ̆',
    'ɔɚ̆',
    'ʊɚ̆',
  ],
  triphthongs: [
    'aɪr',
    'aʊr',
    'ɔɪr',
    'eɪr',
    'oʊr',
    'aɪ̆ɚ̆',
    'aɪ̆ə̆',
    'aʊ̆ɚ̆',
    'ɔɪ̆ɚ̆',
    'ɪ̆ʊɚ̆',
    'ɛɪ̆ɚ̆',
    'oʊ̆ɚ̆',
  ],
  diacritics: [
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
  stress: ['ˈ', 'ˌ'],
  tones: [
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
  glottalStops: ['ʔ', 'ʕ', 'ʡ', 'ʢ'],
}

// Helper to detect symbol categories from a list of symbols
const detectSymbolCategory = (symbols: string[]): string[] => {
  const categories: Set<string> = new Set()

  symbols.forEach((symbol) => {
    for (const [category, categorySymbols] of Object.entries(
      SYMBOL_CATEGORIES,
    )) {
      if (categorySymbols.includes(symbol)) {
        categories.add(category)
      }
    }
  })

  return Array.from(categories)
}

// Helper to build compact groups from custom symbols
const buildGroupsFromSymbols = (symbols: string[]) => {
  return [{ letter: 'Symbols', symbols }]
}

// IPA symbols organized by Latin letters (matching TypeIt layout)
const LETTER_GROUPS = [
  { letter: 'A', symbols: ['a', 'æ', 'ɑ', 'ɐ'] },
  { letter: 'B', symbols: ['b', 'β', 'ɓ'] },
  { letter: 'C', symbols: ['c', 'ç', 'ɕ'] },
  { letter: 'D', symbols: ['d', 'ð', 'ɖ', 'ɗ'] },
  { letter: 'E', symbols: ['e', 'ə', 'ɚ', 'ɞ', 'ɘ'] },
  { letter: 'F', symbols: ['f'] },
  { letter: 'G', symbols: ['g', 'ɠ', 'ɢ'] },
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
  { letter: 'T', symbols: ['t', 'θ'] },
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
    symbols: ['ˈ', 'ˌ', '̆', 'ː', 'ˑ', '‿', '͡', '|', '||'],
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

type LetterGroup = (typeof LETTER_GROUPS)[number]

/**
 * A plain letter (for example, A → a) is entered directly from the keyboard,
 * so it intentionally has no IPA Alt/Option shortcut. The remaining symbols
 * in that group begin the Alt/Option cycle at one press.
 */
const getShortcutSymbols = (group: LetterGroup): string[] => {
  if (group.letter.length !== 1) return []
  return group.symbols[0] === group.letter.toLowerCase()
    ? group.symbols.slice(1)
    : group.symbols
}

// Direct keyboard shortcuts for diacritics and suprasegmentals. Repeated keys
// are deliberately kept as sequences (rather than T9 cycles) to mirror the
// printable hotkey reference.
const DIRECT_SHORTCUTS: { [key: string]: string } = {
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
}

const getDirectShortcutToken = (event: KeyboardEvent): string | null => {
  const { code, key } = event

  if (code.startsWith('Key')) return code.substring(3).toLowerCase()
  if (code.startsWith('Digit')) return code.substring(5)

  const codeTokens: { [key: string]: string } = {
    Period: '.',
    Comma: ',',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
  }

  if (codeTokens[code]) return codeTokens[code]
  return key.length === 1 ? key.toLowerCase() : null
}

const isDirectShortcutPrefix = (prefix: string, keys: string): boolean =>
  Object.keys(DIRECT_SHORTCUTS).some(
    (shortcut) =>
      shortcut.startsWith(`${prefix}${keys}`) &&
      shortcut !== `${prefix}${keys}`,
  )

export const IPAKeyboard: React.FC<IPAKeyboardProps> = ({
  onSymbolClick,
  onSymbolPreview,
  showTextArea = true,
  compact = false,
  filterCategories,
  customSymbols,
  symbolBankCategories,
  autoDetectCategory = false,
  hideInstructions = false,
  title,
  showCategoriesInCompact = false,
  useRichTextEditor = false,
  editorRef: externalEditorRef,
  persistClickedSymbols = true,
}) => {
  const STORAGE_KEY = 'ipa-keyboard-text'
  const HISTORY_KEY = 'ipa-keyboard-history'

  // SSR-safe: start empty on the server and the first client render, then load
  // persisted values from localStorage after mount (see hydration effect below).
  // Reading localStorage in the useState initializer would mismatch the server
  // render and cause a hydration warning + a visible flash.
  const [text, setText] = useState('')

  // Track clicked symbols for blue highlighting (only when persistClickedSymbols)
  const [clickedSymbols, setClickedSymbols] = useState<Set<string>>(new Set())

  // Flips true once localStorage has been read; save effects wait for it so the
  // initial empty state can't overwrite stored data before it loads.
  const [hydrated, setHydrated] = useState(false)

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const toast = useToast()
  const internalEditorRef = useRef<any>(null)
  const editorRef = externalEditorRef || internalEditorRef
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const keyboardRootRef = useRef<HTMLDivElement>(null)

  const handleRichTextSymbolInsert = useCallback(
    (symbol: string) => {
      if (onSymbolClick) {
        onSymbolClick(symbol)
      }
      setSelectedSymbol(symbol)
    },
    [onSymbolClick],
  )

  const handleRichTextClear = useCallback(() => {
    setClickedSymbols(new Set())
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_KEY)
    }
  }, [])

  // T9 state — refs so rapid Option+letter presses see fresh values (React state in effect closure was stale)
  const [keyPressCount, setKeyPressCount] = useState<{ [key: string]: number }>(
    {},
  )
  const [lastKeyTime, setLastKeyTime] = useState<{ [key: string]: number }>({})
  const keyPressCountRef = useRef<{ [key: string]: number }>({})
  const lastKeyTimeRef = useRef<{ [key: string]: number }>({})
  const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ref for tracking multi-key direct shortcuts (e.g., "ooo", "sss", "...").
  // Prefixes wait briefly so a shorter mapping never prevents its longer
  // counterpart from being typed.
  const pendingKeysRef = useRef<string>('')
  const pendingShortcutPrefixRef = useRef<string>('')
  const pendingKeysTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null)

  // Load persisted state once, after mount (keeps SSR and first client render
  // identical, then hydrates from localStorage). Rich-editor content is handled
  // separately by RichTextIPAEditor, so text is only restored for the plain textarea.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!useRichTextEditor) {
      const savedText = localStorage.getItem(STORAGE_KEY)
      if (savedText) setText(savedText)
    }
    if (persistClickedSymbols) {
      const savedHistory = localStorage.getItem(HISTORY_KEY)
      if (savedHistory) {
        try {
          setClickedSymbols(new Set(JSON.parse(savedHistory)))
        } catch (e) {
          // ignore malformed history
        }
      }
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save text to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated) return
    if (typeof window !== 'undefined' && !useRichTextEditor) {
      localStorage.setItem(STORAGE_KEY, text)
    }
  }, [text, useRichTextEditor, hydrated])

  // Save clicked symbols to localStorage (only when persistClickedSymbols)
  useEffect(() => {
    if (!hydrated) return
    if (persistClickedSymbols && typeof window !== 'undefined') {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(Array.from(clickedSymbols)),
      )
    }
  }, [clickedSymbols, persistClickedSymbols, hydrated])

  const filteredGroups = useMemo(() => {
    if (customSymbols && customSymbols.length > 0) {
      if (autoDetectCategory) {
        const detectedCategories = detectSymbolCategory(customSymbols)
        const allowedSymbols = new Set(
          detectedCategories.flatMap(
            (cat) =>
              SYMBOL_CATEGORIES[cat as keyof typeof SYMBOL_CATEGORIES] || [],
          ),
        )
        return LETTER_GROUPS.map((group) => ({
          ...group,
          symbols: group.symbols.filter((sym) => allowedSymbols.has(sym)),
        })).filter((group) => group.symbols.length > 0)
      }
      return buildGroupsFromSymbols(customSymbols)
    }

    if (filterCategories && !filterCategories.includes('all')) {
      const allowedSymbols = new Set(
        filterCategories.flatMap(
          (cat) =>
            SYMBOL_CATEGORIES[cat as keyof typeof SYMBOL_CATEGORIES] || [],
        ),
      )
      return LETTER_GROUPS.map((group) => ({
        ...group,
        symbols: group.symbols.filter((sym) => allowedSymbols.has(sym)),
      })).filter((group) => group.symbols.length > 0)
    }

    return LETTER_GROUPS
  }, [customSymbols, autoDetectCategory, filterCategories])

  const filteredGroupsRef = useRef(filteredGroups)
  filteredGroupsRef.current = filteredGroups
  const buttonSize = compact ? '28px' : '32px'
  const buttonFontSize = compact ? 'sm' : 'lg'
  // Shortcut display labels — Mac glyphs vs Windows/Linux text. Only rendered
  // inside the Drawer (mounts client-side on open), so navigator sniffing is
  // hydration-safe here.
  const shiftAltLabel = isApplePlatform() ? '⇧⌥' : 'Shift+Alt+'
  const altLabel = isApplePlatform() ? '⌥' : 'Alt+'
  const spacing = compact ? 0.5 : 1
  const hideKeyboardShortcuts = false // Always show shortcuts in tooltips

  // IPA shortcut handling — direct Option/Alt diacritic combos first, then
  // T9-style Option/Alt+letter cycling (Option on Mac, Alt on Windows/Linux)
  useEffect(() => {
    const isKeyboardFocused = (): boolean => {
      const root = keyboardRootRef.current
      const activeElement = document.activeElement
      return !!(
        root &&
        activeElement &&
        activeElement instanceof Node &&
        root.contains(activeElement)
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with Cmd shortcuts on Mac (copy/paste)
      if (event.metaKey) {
        return
      }

      if (!isKeyboardFocused()) {
        return
      }

      // Chrome focuses its three-dot menu after a bare Alt press. Suppress both
      // halves of that press while an IPA input is focused; Alt remains fully
      // available as the modifier for the keyboard's shortcuts below.
      if (event.key === 'Alt') {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      // Helper to insert a symbol directly
      const insertDirectSymbol = (symbol: string) => {
        event.preventDefault()
        event.stopPropagation()

        setSelectedSymbol(symbol)
        setCurrentSymbol(symbol)

        if (onSymbolPreview) {
          onSymbolPreview(symbol)
        } else if (useRichTextEditor && editorRef.current?.insertSymbol) {
          editorRef.current.insertSymbol(symbol, false)
        } else {
          setText((prev) => prev + symbol)
        }

        if (persistClickedSymbols) {
          setClickedSymbols((prev) => {
            const newSet = new Set(prev)
            newSet.add(symbol)
            return newSet
          })
        }

        setTimeout(() => {
          setCurrentSymbol(null)
          setSelectedSymbol(null)
        }, 200)
      }

      // Normal typing (no Option/Alt) breaks any in-progress T9 cycle so the
      // next shortcut press starts a fresh cycle instead of replacing the
      // character the user just typed. Bare modifier presses don't count.
      if (!event.altKey || event.ctrlKey) {
        const k = event.key
        if (
          k.length === 1 ||
          k === 'Backspace' ||
          k === 'Delete' ||
          k === 'Enter'
        ) {
          keyPressCountRef.current = {}
          lastKeyTimeRef.current = {}
        }
        return
      }

      // Option/Alt shortcuts — direct diacritic combos first, then T9 cycling.
      // AltGr (Ctrl+Alt on Windows intl layouts) is excluded above so it still
      // types its normal characters.
      if (event.altKey && !event.ctrlKey) {
        const eventKey = event.key
        const code = event.code

        // Pure modifier presses / navigation keys — leave alone
        if (
          eventKey === 'Alt' ||
          eventKey === 'Shift' ||
          eventKey === 'Control' ||
          eventKey === 'Meta' ||
          eventKey === 'Tab' ||
          eventKey === 'Escape'
        ) {
          return
        }

        if (event.repeat) {
          // T9 counts discrete presses; swallow auto-repeat so held Option
          // doesn't spray special characters into the editor
          event.preventDefault()
          event.stopPropagation()
          return
        }

        const shortcutPrefix = event.shiftKey ? 'shift+alt+' : 'alt+'
        const shortcutToken = getDirectShortcutToken(event)

        if (shortcutToken) {
          // Prevent the browser's Option/Alt character from leaking into the
          // editor while we wait to see whether this is a repeated-key shortcut.
          const previousPending =
            pendingShortcutPrefixRef.current === shortcutPrefix
              ? pendingKeysRef.current
              : ''
          const newPending = previousPending + shortcutToken
          const directShortcut = shortcutPrefix + newPending
          const symbol = DIRECT_SHORTCUTS[directShortcut]
          const hasLongerMatch = isDirectShortcutPrefix(
            shortcutPrefix,
            newPending,
          )

          if (pendingKeysTimeoutRef.current) {
            clearTimeout(pendingKeysTimeoutRef.current)
            pendingKeysTimeoutRef.current = null
          }

          if (symbol || hasLongerMatch) {
            event.preventDefault()
            event.stopPropagation()
            notifyIpaAltLetterShortcutHandled()
            pendingKeysRef.current = newPending
            pendingShortcutPrefixRef.current = shortcutPrefix

            if (symbol && !hasLongerMatch) {
              insertDirectSymbol(symbol)
              pendingKeysRef.current = ''
              pendingShortcutPrefixRef.current = ''
              return
            }

            // A sequence such as O/OO/OOO, S/SS/SSS, F/FF, or ./../...
            // has a valid shorter mapping. Commit it only after the sequence
            // window passes, allowing the longer hotkey to win when typed.
            pendingKeysTimeoutRef.current = setTimeout(() => {
              const pendingSymbol =
                DIRECT_SHORTCUTS[
                  pendingShortcutPrefixRef.current + pendingKeysRef.current
                ]
              if (pendingSymbol) insertDirectSymbol(pendingSymbol)
              pendingKeysRef.current = ''
              pendingShortcutPrefixRef.current = ''
              pendingKeysTimeoutRef.current = null
            }, 500)
            return
          }

          pendingKeysRef.current = ''
          pendingShortcutPrefixRef.current = ''
        }

        // T9 cycling: plain Option/Alt + letter (Shift+Option stays direct-only,
        // and Shift+letter keeps typing capitals)
        if (event.shiftKey) {
          return
        }

        // Use event.code to get the physical key, not the character it produces
        // (Option+A yields "å" on Mac; code is "KeyA", "Digit2", etc.)
        let key = ''
        if (code.startsWith('Key')) {
          // Extract the letter from "KeyA" -> "A"
          key = code.substring(3).toLowerCase()
        } else if (code.startsWith('Digit')) {
          // Extract the digit from "Digit1" -> "1"
          key = code.substring(5)
        }

        // Skip if no key was extracted — allows normal Alt+key behavior for
        // anything we don't handle
        if (!key) {
          return
        }

        const letterGroup = filteredGroupsRef.current.find(
          (group) => group.letter.toLowerCase() === key || group.letter === key,
        )

        if (letterGroup) {
          const shortcutSymbols = getShortcutSymbols(letterGroup)
          if (shortcutSymbols.length === 0) {
            return
          }

          if (event.repeat) {
            event.preventDefault()
            event.stopPropagation()
            return
          }

          // Capture phase + stop propagation
          event.preventDefault()
          event.stopPropagation()

          // Mac: Option+letter can start a dead-key composition even after
          // preventDefault — arm suppression so the stray ¨/´ etc. gets dropped
          notifyIpaAltLetterShortcutHandled()

          const now = Date.now()
          const lastTime = lastKeyTimeRef.current[key] ?? 0
          const timeDiff = now - lastTime

          if (commitTimeoutRef.current) {
            clearTimeout(commitTimeoutRef.current)
            commitTimeoutRef.current = null
          }

          const currentCount = keyPressCountRef.current[key] ?? 0
          let newCount: number
          if (timeDiff > 1000) {
            newCount = 0
          } else {
            newCount = (currentCount + 1) % shortcutSymbols.length
          }

          keyPressCountRef.current = {
            ...keyPressCountRef.current,
            [key]: newCount,
          }
          lastKeyTimeRef.current = { ...lastKeyTimeRef.current, [key]: now }
          setKeyPressCount({ ...keyPressCountRef.current })
          setLastKeyTime({ ...lastKeyTimeRef.current })

          const symbol = shortcutSymbols[newCount]
          const previousSymbol =
            newCount > 0
              ? shortcutSymbols[newCount - 1]
              : shortcutSymbols[shortcutSymbols.length - 1]

          setSelectedSymbol(symbol)
          setCurrentSymbol(symbol)

          const withinCycle = timeDiff <= 1000

          // Insert immediately and synchronously - this cancels IME composition
          if (onSymbolPreview) {
            onSymbolPreview(symbol)
          } else if (useRichTextEditor && editorRef.current?.insertSymbol) {
            editorRef.current.insertSymbol(symbol, withinCycle)
          } else {
            setText((prev) => {
              if (withinCycle) {
                const symbolToReplace = previousSymbol
                const lastIndex = prev.lastIndexOf(symbolToReplace)
                if (lastIndex !== -1) {
                  return prev.substring(0, lastIndex) + symbol
                }
              }
              return prev + symbol
            })
          }

          const newTimeoutId = setTimeout(() => {
            commitTimeoutRef.current = null
            if (persistClickedSymbols) {
              setClickedSymbols((prev) => {
                const newSet = new Set(prev)
                newSet.add(symbol)
                return newSet
              })
            }

            setTimeout(() => {
              setCurrentSymbol(null)
              setSelectedSymbol(null)
            }, 50)

            if (onSymbolClick && symbol) {
              onSymbolClick(symbol)
              if (!onSymbolPreview && !useRichTextEditor) {
                setText('')
              }
            }
          }, 1000)

          commitTimeoutRef.current = newTimeoutId
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt' && isKeyboardFocused()) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      if (commitTimeoutRef.current) {
        clearTimeout(commitTimeoutRef.current)
        commitTimeoutRef.current = null
      }
      if (pendingKeysTimeoutRef.current) {
        clearTimeout(pendingKeysTimeoutRef.current)
        pendingKeysTimeoutRef.current = null
      }
    }
  }, [
    useRichTextEditor,
    editorRef,
    onSymbolClick,
    onSymbolPreview,
    persistClickedSymbols,
  ])

  // macOS: block ¨ ´ etc. on plain textarea when Option+letter IPA fires (same as rich editor)
  useEffect(() => {
    if (useRichTextEditor || !showTextArea) return
    const el = textareaRef.current
    if (!el) return

    const onBeforeInput = (e: Event) => {
      const ie = e as InputEvent
      if (
        shouldSuppressMacOptionDeadKeyBeforeInput(ie.inputType, ie.data ?? null)
      ) {
        e.preventDefault()
      }
    }

    el.addEventListener('beforeinput', onBeforeInput, true)
    return () => el.removeEventListener('beforeinput', onBeforeInput, true)
  }, [useRichTextEditor, showTextArea])

  const handleSymbolClick = (symbol: string) => {
    // Clicking a symbol breaks any in-progress T9 shortcut cycle
    keyPressCountRef.current = {}
    lastKeyTimeRef.current = {}

    // Track that this symbol was clicked (immediately printed)
    if (persistClickedSymbols) {
      setClickedSymbols((prev) => {
        const newSet = new Set(prev)
        newSet.add(symbol)
        return newSet
      })
    }

    if (onSymbolClick) {
      onSymbolClick(symbol)
    } else if (useRichTextEditor && editorRef.current?.insertSymbol) {
      editorRef.current.insertSymbol(symbol)
    } else {
      setText((prev) => prev + symbol)
    }
  }

  // Helper to get button background color
  const getButtonBg = (symbol: string) => {
    const isSelected = selectedSymbol === symbol
    const isInHistory = clickedSymbols.has(symbol)

    // Light turquoise for currently cycling symbol (temporary highlight during T9)
    if (isSelected) {
      return 'brand.blueLight'
    }

    // Blue for symbols that have been used (permanent highlight)
    if (isInHistory) {
      return 'brand.blue'
    }

    // White for unused symbols
    return 'white'
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copied to clipboard',
        description: 'IPA text has been copied to your clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  const clearText = () => {
    setText('')
    setClickedSymbols(new Set()) // Clear the history

    // If using rich text editor, clear it too
    if (useRichTextEditor && editorRef.current?.clear) {
      editorRef.current.clear()
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(HISTORY_KEY) // Clear history from storage
    }
  }

  return (
    <Box
      ref={keyboardRootRef}
      w="full"
      maxW="1000px"
      mx="auto"
      maxH={showTextArea ? 'calc(100vh - 110px)' : undefined}
      overflowY={showTextArea ? 'auto' : undefined}
    >
      <VStack
        spacing={compact ? 1.5 : 2}
        align="stretch"
        w="full"
        p={compact ? 1.5 : 2}
      >
        {/* Header: optional title + an always-available Instructions side panel.
            The title only renders when an explicit (non-empty) one is passed,
            so pages with their own heading don't get a duplicate. */}
        {!hideInstructions && (
          <Flex align="center" justify="space-between" gap={2}>
            {title ? (
              <Text fontSize="lg" fontWeight="bold" color="brand.iris">
                {title}
              </Text>
            ) : (
              <Box />
            )}
            <Button
              size="sm"
              variant="ghost"
              colorScheme="purple"
              leftIcon={<InfoOutlineIcon />}
              onClick={() => setShowInstructions(true)}
            >
              Instructions
            </Button>
          </Flex>
        )}

        {/* Instructions side panel — accessible any time from the button above. */}
        <Drawer
          isOpen={showInstructions}
          placement="right"
          onClose={() => setShowInstructions(false)}
          size="sm"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader color="brand.iris">
              How to use the keyboard
            </DrawerHeader>
            <DrawerBody>
              <VStack
                align="stretch"
                spacing={4}
                fontSize="sm"
                color="gray.700"
              >
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    General instructions
                  </Text>
                  <Text>
                    Click on any symbol to add it to the text box. Plain
                    letters, such as a, are typed normally and have no IPA
                    shortcut. The alternate symbols use shortcuts, i.e.{' '}
                    {ipaShortcutKeyRepeated('A', 1)} (æ),{' '}
                    {ipaShortcutKeyRepeated('A', 2)} (ɑ), etc. Hovering over a
                    symbol will reveal its shortcut. Symbols cycle directly in
                    the text area until you stop pressing or press a different
                    key.
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Diacritics (direct access)
                  </Text>
                  <VStack align="stretch" spacing={0.5}>
                    <Text>
                      {shiftAltLabel}O — voiceless ( ̥ ), {shiftAltLabel}OO —
                      voiceless above ( ̊ )
                    </Text>
                    <Text>
                      {shiftAltLabel}D — dental ( ̪ ), {altLabel}F — tie bar ( ͡
                      ), {altLabel}FF — linking ( ‿ )
                    </Text>
                    <Text>
                      {altLabel}. — long ( ː ), {altLabel}.. — extra-short ( ̆ )
                    </Text>
                    <Text mt={1} fontStyle="italic" color="gray.500">
                      Shift still types capitals. Hover any symbol to see its
                      shortcut.
                    </Text>
                  </VStack>
                </Box>
                {useRichTextEditor && (
                  <>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Text formatting
                      </Text>
                      <Text>
                        ⌘/Ctrl + B (bold), I (italic), U (underline).
                        Superscript and subscript from the toolbar.
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        History
                      </Text>
                      <Text>⌘/Ctrl + Z to undo, ⌘⇧Z / Ctrl + Y to redo.</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Copy
                      </Text>
                      <Text>
                        Use the copy button to put your transcription on the
                        clipboard.
                      </Text>
                    </Box>
                  </>
                )}
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Sections
                  </Text>
                  <Text>
                    Expand or collapse the categories below to find vowels,
                    consonants, diphthongs, diacritics, tones, and
                    suprasegmentals.
                  </Text>
                </Box>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* IPA Symbol Grid - TypeIt Layout.
            Prevent mousedown default so clicking keys never steals focus from
            the text area / rich editor — inserts land at the live caret. */}
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          boxShadow="sm"
          p={compact ? 2 : 3}
          bg="white"
          onMouseDownCapture={(e) => e.preventDefault()}
        >
          {/* Compact mode - simple symbol list or categorized */}
          {compact && (customSymbols || symbolBankCategories) ? (
            <>
              {showCategoriesInCompact && symbolBankCategories ? (
                // Categorized compact mode with letter badges
                <VStack spacing={3} align="stretch">
                  {symbolBankCategories.consonants &&
                    symbolBankCategories.consonants.length > 0 && (
                      <Box bg="gray.50" p={1.5} borderRadius="md">
                        <Flex align="center" gap={1.5} flexWrap="wrap">
                          <Badge
                            colorScheme="purple"
                            fontSize="sm"
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                            minW="fit-content"
                          >
                            Consonants
                          </Badge>
                          {symbolBankCategories.consonants.map(
                            (symbol, index) => {
                              const shortcut = getSymbolShortcut(symbol)
                              const label = shortcut
                                ? `${getSymbolName(symbol)} (${shortcut})`
                                : getSymbolName(symbol)
                              return (
                                <Tooltip key={index} label={label}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ipa-text"
                                    fontSize={buttonFontSize}
                                    minW={buttonSize}
                                    h={buttonSize}
                                    onClick={() => handleSymbolClick(symbol)}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{
                                      bg: 'purple.50',
                                      borderColor: 'brand.iris',
                                      color: 'brand.iris',
                                    }}
                                    bg={getButtonBg(symbol)}
                                  >
                                    {symbol}
                                  </Button>
                                </Tooltip>
                              )
                            },
                          )}
                        </Flex>
                      </Box>
                    )}
                  {symbolBankCategories.monophthongs &&
                    symbolBankCategories.monophthongs.length > 0 && (
                      <Box bg="gray.50" p={1.5} borderRadius="md">
                        <Flex align="center" gap={1.5} flexWrap="wrap">
                          <Badge
                            colorScheme="purple"
                            fontSize="sm"
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                            minW="fit-content"
                          >
                            Monophthongs
                          </Badge>
                          {symbolBankCategories.monophthongs.map(
                            (symbol, index) => {
                              const shortcut = getSymbolShortcut(symbol)
                              const label = shortcut
                                ? `${getSymbolName(symbol)} (${shortcut})`
                                : getSymbolName(symbol)
                              return (
                                <Tooltip key={index} label={label}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ipa-text"
                                    fontSize={buttonFontSize}
                                    minW={buttonSize}
                                    h={buttonSize}
                                    onClick={() => handleSymbolClick(symbol)}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{
                                      bg: 'purple.50',
                                      borderColor: 'brand.iris',
                                      color: 'brand.iris',
                                    }}
                                    bg={getButtonBg(symbol)}
                                  >
                                    {symbol}
                                  </Button>
                                </Tooltip>
                              )
                            },
                          )}
                        </Flex>
                      </Box>
                    )}
                  {symbolBankCategories.diphthongs &&
                    symbolBankCategories.diphthongs.length > 0 && (
                      <Box bg="gray.50" p={2} borderRadius="md">
                        <Flex align="center" gap={2} flexWrap="wrap">
                          <Badge
                            colorScheme="purple"
                            fontSize="md"
                            px={2}
                            py={1}
                            borderRadius="full"
                            minW="fit-content"
                          >
                            Diphthongs
                          </Badge>
                          {symbolBankCategories.diphthongs.map(
                            (symbol, index) => {
                              const shortcut = getSymbolShortcut(symbol)
                              const label = shortcut
                                ? `${getSymbolName(symbol)} (${shortcut})`
                                : getSymbolName(symbol)
                              return (
                                <Tooltip key={index} label={label}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ipa-text"
                                    fontSize={buttonFontSize}
                                    minW={buttonSize}
                                    h={buttonSize}
                                    onClick={() => handleSymbolClick(symbol)}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{
                                      bg: 'purple.50',
                                      borderColor: 'brand.iris',
                                      color: 'brand.iris',
                                    }}
                                    bg={getButtonBg(symbol)}
                                  >
                                    {symbol}
                                  </Button>
                                </Tooltip>
                              )
                            },
                          )}
                        </Flex>
                      </Box>
                    )}
                  {symbolBankCategories.triphthongs &&
                    symbolBankCategories.triphthongs.length > 0 && (
                      <Box bg="gray.50" p={2} borderRadius="md">
                        <Flex align="center" gap={2} flexWrap="wrap">
                          <Badge
                            colorScheme="purple"
                            fontSize="md"
                            px={2}
                            py={1}
                            borderRadius="full"
                            minW="fit-content"
                          >
                            Triphthongs
                          </Badge>
                          {symbolBankCategories.triphthongs.map(
                            (symbol, index) => {
                              const shortcut = getSymbolShortcut(symbol)
                              const label = shortcut
                                ? `${getSymbolName(symbol)} (${shortcut})`
                                : getSymbolName(symbol)
                              return (
                                <Tooltip key={index} label={label}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ipa-text"
                                    fontSize={buttonFontSize}
                                    minW={buttonSize}
                                    h={buttonSize}
                                    onClick={() => handleSymbolClick(symbol)}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{
                                      bg: 'purple.50',
                                      borderColor: 'brand.iris',
                                      color: 'brand.iris',
                                    }}
                                    bg={getButtonBg(symbol)}
                                  >
                                    {symbol}
                                  </Button>
                                </Tooltip>
                              )
                            },
                          )}
                        </Flex>
                      </Box>
                    )}
                  {symbolBankCategories.diacritics &&
                    symbolBankCategories.diacritics.length > 0 && (
                      <Box bg="gray.50" p={1.5} borderRadius="md">
                        <Flex align="center" gap={1.5} flexWrap="wrap">
                          <Badge
                            colorScheme="purple"
                            fontSize="sm"
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                            minW="fit-content"
                          >
                            Diacritics
                          </Badge>
                          {symbolBankCategories.diacritics.map(
                            (symbol, index) => {
                              const shortcut = getSymbolShortcut(symbol)
                              const label = shortcut
                                ? `${getSymbolName(symbol)} (${shortcut})`
                                : getSymbolName(symbol)
                              return (
                                <Tooltip key={index} label={label}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ipa-text"
                                    fontSize={buttonFontSize}
                                    minW={buttonSize}
                                    h={buttonSize}
                                    onClick={() => handleSymbolClick(symbol)}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{
                                      bg: 'purple.50',
                                      borderColor: 'brand.iris',
                                      color: 'brand.iris',
                                    }}
                                    bg={getButtonBg(symbol)}
                                  >
                                    {symbol}
                                  </Button>
                                </Tooltip>
                              )
                            },
                          )}
                        </Flex>
                      </Box>
                    )}
                </VStack>
              ) : (
                // Simple compact mode
                <Flex wrap="wrap" gap={spacing}>
                  {customSymbols?.map((symbol, index) => {
                    const shortcut = getSymbolShortcut(symbol)
                    const label = shortcut
                      ? `${getSymbolName(symbol)} (${shortcut})`
                      : getSymbolName(symbol)
                    return (
                      <Tooltip key={index} label={label}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ipa-text"
                          fontSize={buttonFontSize}
                          minW={buttonSize}
                          h={buttonSize}
                          onClick={() => handleSymbolClick(symbol)}
                          borderRadius="lg"
                          fontWeight="semibold"
                          _hover={{
                            bg: 'purple.50',
                            borderColor: 'brand.iris',
                            color: 'brand.iris',
                          }}
                          bg={getButtonBg(symbol)}
                        >
                          {symbol}
                        </Button>
                      </Tooltip>
                    )
                  })}
                </Flex>
              )}
            </>
          ) : (
            <>
              {/* Dynamic keyboard layout - groups flow naturally with flex wrap */}
              <Flex wrap="wrap" gap={1.5}>
                {filteredGroups
                  .filter(
                    (group) =>
                      group.symbols.length > 0 &&
                      !['Diacritics', 'Suprasegmentals', 'Tones'].includes(
                        group.letter,
                      ),
                  )
                  .map((group) => {
                    const shortcutSymbols = getShortcutSymbols(group)
                    const groupLabel = (
                      <Badge
                        bg="brand.purple"
                        color="white"
                        fontSize="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="28px"
                        h="28px"
                        px={1.5}
                        borderRadius="full"
                      >
                        {group.letter}
                      </Badge>
                    )

                    return (
                      <Box
                        key={group.letter}
                        bg="gray.50"
                        p={1.5}
                        borderRadius="md"
                        minW="fit-content"
                      >
                        <Flex align="center" gap={1.5}>
                          {!hideKeyboardShortcuts &&
                            (shortcutSymbols.length > 0 ? (
                              <Tooltip
                                label={`${ipaShortcutKey(
                                  group.letter,
                                )} — press repeatedly (within 1s) to cycle alternate symbols`}
                              >
                                {groupLabel}
                              </Tooltip>
                            ) : (
                              groupLabel
                            ))}
                          <HStack spacing={0.5}>
                            {group.symbols.map((symbol, idx) => {
                              const shortcutIndex =
                                shortcutSymbols.indexOf(symbol)
                              const shortcut =
                                shortcutIndex === -1
                                  ? null
                                  : ipaShortcutKeyRepeated(
                                      group.letter,
                                      shortcutIndex + 1,
                                    )

                              return (
                                <Tooltip
                                  key={idx}
                                  label={
                                    hideKeyboardShortcuts
                                      ? `${symbol} - ${getSymbolName(symbol)}`
                                      : shortcut
                                      ? `${symbol} - ${getSymbolName(
                                          symbol,
                                        )} (${shortcut})`
                                      : `${symbol} - ${getSymbolName(symbol)}`
                                  }
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ipa-text"
                                    fontSize={buttonFontSize}
                                    minW={buttonSize}
                                    h={buttonSize}
                                    onClick={() => handleSymbolClick(symbol)}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{
                                      bg: 'purple.50',
                                      borderColor: 'brand.iris',
                                      color: 'brand.iris',
                                    }}
                                    bg={getButtonBg(symbol)}
                                  >
                                    {symbol}
                                  </Button>
                                </Tooltip>
                              )
                            })}
                          </HStack>
                        </Flex>
                      </Box>
                    )
                  })}
              </Flex>

              {/* Advanced rows — collapsed by default to reduce scrolling */}
              {!compact && (
                <Accordion allowMultiple defaultIndex={[]} mt={2}>
                  <AccordionItem border="none">
                    <AccordionButton
                      bg="gray.100"
                      borderRadius="md"
                      _hover={{ bg: 'gray.200' }}
                      px={3}
                      py={2}
                    >
                      <Box flex="1" textAlign="left" fontWeight="bold">
                        Diacritics & suprasegmentals
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={3} pt={2} px={0}>
                      <Flex wrap="wrap" gap={2}>
                        {['Diacritics', 'Suprasegmentals'].map((letter) => {
                          const group = filteredGroups.find(
                            (g) => g.letter === letter,
                          )
                          if (!group || group.symbols.length === 0) return null
                          return (
                            <Box
                              key={letter}
                              bg="gray.50"
                              p={1.5}
                              borderRadius="md"
                              minW="fit-content"
                            >
                              <Flex align="center" gap={1.5}>
                                <Badge
                                  bg="brand.purple"
                                  color="white"
                                  fontSize="xs"
                                  px={2}
                                  py={0.5}
                                  borderRadius="full"
                                >
                                  {letter}
                                </Badge>
                                <Flex wrap="wrap" gap={2}>
                                  {group.symbols.map((symbol, idx) => {
                                    const shortcut = getSymbolShortcut(symbol)
                                    const label = shortcut
                                      ? `${symbol} - ${getSymbolName(
                                          symbol,
                                        )} (${shortcut})`
                                      : `${symbol} - ${getSymbolName(symbol)}`

                                    return (
                                      <Tooltip key={idx} label={label}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="ipa-text"
                                          fontSize={buttonFontSize}
                                          minW={buttonSize}
                                          h={buttonSize}
                                          onClick={() =>
                                            handleSymbolClick(symbol)
                                          }
                                          borderRadius="lg"
                                          fontWeight="semibold"
                                          _hover={{
                                            bg: 'purple.50',
                                            borderColor: 'brand.iris',
                                            color: 'brand.iris',
                                          }}
                                          bg={getButtonBg(symbol)}
                                        >
                                          {symbol === TIE_BAR ? (
                                            <Box
                                              as="span"
                                              display="inline-block"
                                              transform="translateX(0.5em)"
                                            >
                                              {symbol}
                                            </Box>
                                          ) : (
                                            symbol
                                          )}
                                        </Button>
                                      </Tooltip>
                                    )
                                  })}
                                </Flex>
                              </Flex>
                            </Box>
                          )
                        })}
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem border="none" mt={2}>
                    <AccordionButton
                      bg="gray.100"
                      borderRadius="md"
                      _hover={{ bg: 'gray.200' }}
                      px={3}
                      py={2}
                    >
                      <Box flex="1" textAlign="left" fontWeight="bold">
                        Tones
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={3} pt={2} px={0}>
                      <Flex wrap="wrap" gap={2}>
                        {(() => {
                          const group = filteredGroups.find(
                            (g) => g.letter === 'Tones',
                          )
                          if (!group || group.symbols.length === 0) return null
                          return (
                            <Box
                              bg="gray.50"
                              p={2}
                              borderRadius="md"
                              minW="fit-content"
                            >
                              <Flex align="center" gap={2}>
                                <Badge
                                  bg="brand.purple"
                                  color="white"
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                >
                                  Tones
                                </Badge>
                                <Flex wrap="wrap" gap={2}>
                                  {group.symbols.map((symbol, idx) => (
                                    <Tooltip
                                      key={idx}
                                      label={`${symbol} - ${getSymbolName(
                                        symbol,
                                      )} (Tones)`}
                                    >
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="ipa-text"
                                        fontSize={buttonFontSize}
                                        minW={buttonSize}
                                        h={buttonSize}
                                        onClick={() =>
                                          handleSymbolClick(symbol)
                                        }
                                        borderRadius="lg"
                                        fontWeight="semibold"
                                        _hover={{
                                          bg: 'purple.50',
                                          borderColor: 'brand.iris',
                                          color: 'brand.iris',
                                        }}
                                        bg={getButtonBg(symbol)}
                                      >
                                        {symbol}
                                      </Button>
                                    </Tooltip>
                                  ))}
                                </Flex>
                              </Flex>
                            </Box>
                          )
                        })()}
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )}
            </>
          )}
        </Box>

        {/* Text Area with inline action buttons or Rich Text Editor */}
        {showTextArea && (
          <Box
            position="sticky"
            bottom={0}
            zIndex={2}
            bg="white"
            pt={2}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            {useRichTextEditor ? (
              <RichTextIPAEditor
                ref={editorRef}
                onSymbolInsert={handleRichTextSymbolInsert}
                onClear={handleRichTextClear}
                placeholder="Type or click symbols to create IPA transcription..."
                minHeight="120px"
                maxHeight="280px"
              />
            ) : (
              <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                boxShadow="sm"
                p={2}
                bg="white"
                position="relative"
              >
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or click symbols to create IPA transcription..."
                  className="ipa-text"
                  fontSize="lg"
                  minH="80px"
                  resize="vertical"
                  border="1px solid"
                  borderColor="gray.300"
                  _focus={{ borderColor: 'brand.iris' }}
                  pr="100px" // Make room for buttons
                />
                {/* Action buttons positioned inside textarea */}
                <Flex position="absolute" top="6" right="6" gap={1}>
                  {text && (
                    <Tooltip label="Clear">
                      <IconButton
                        aria-label="Clear text"
                        icon={<CloseIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={clearText}
                        colorScheme="gray"
                      />
                    </Tooltip>
                  )}
                  <Tooltip label="Copy to clipboard">
                    <IconButton
                      aria-label="Copy to clipboard"
                      icon={<CopyIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      colorScheme="purple"
                    />
                  </Tooltip>
                </Flex>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default IPAKeyboard
