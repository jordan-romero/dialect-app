import React, { useState, useEffect, useRef } from 'react'
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
} from '@chakra-ui/react'
import { CopyIcon, CloseIcon } from '@chakra-ui/icons'
import RichTextIPAEditor from './RichTextIPAEditor'

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
  g: 'voiced velar plosive',
  ŋ: 'velar nasal',
  ʔ: 'glottal stop',
  h: 'voiceless glottal fricative',
  ç: 'voiceless palatal fricative',
  w: 'labial-velar approximant',
  't͡ʃ': 'voiceless postalveolar affricate',
  'tʃ': 'voiceless postalveolar affricate',
  'd͡ʒ': 'voiced postalveolar affricate',
  'dʒ': 'voiced postalveolar affricate',
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
  't͡s': 'voiceless alveolar affricate',
  'ts': 'voiceless alveolar affricate',
  'd͡z': 'voiced alveolar affricate',
  ɰ: 'velar approximant',
  ɒ: 'open back rounded vowel',
  ɞ: 'open-mid central rounded vowel',
  ɢ: 'voiced uvular plosive',
  ɘ: 'close-mid central unrounded vowel',
  ï: 'centralized close front unrounded vowel',
  ⱱ: 'labiodental flap',

  // Diphthongs
  eɪ: 'FACE vowel',
  'eɪ̆': 'FACE vowel',
  aɪ: 'PRICE vowel',
  'aɪ̆': 'PRICE vowel',
  ɔɪ: 'CHOICE vowel',
  'ɔɪ̆': 'CHOICE vowel',
  aʊ: 'MOUTH vowel',
  'aʊ̆': 'MOUTH vowel',
  oʊ: 'GOAT vowel',
  'oʊ̆': 'GOAT vowel',
  ju: 'VIEW sequence',
  'ɪ̆u': 'VIEW sequence',
  ɪr: 'NEAR vowel',
  ɛr: 'SQUARE vowel',
  ɑr: 'START vowel',
  ɔr: 'NORTH vowel',
  ʊr: 'CURE vowel',
  'ɑɚ̆': 'START vowel',
  'ɔɚ̆': 'NORTH vowel',
  'ɛɚ̆': 'SQUARE vowel',
  'ɪɚ̆': 'NEAR vowel',
  'ʊɚ̆': 'CURE vowel',

  // Triphthongs
  aɪr: 'FIRE vowel',
  'aɪ̆ɚ̆': 'FIRE vowel',
  aʊr: 'HOUR vowel',
  'aʊ̆ɚ̆': 'HOUR vowel',
  ɔɪr: 'LAWYER vowel',
  'ɔɪ̆ɚ̆': 'LAWYER vowel',
  eɪr: 'PLAYER vowel',
  'ɛɪ̆ɚ̆': 'PLAYER vowel',
  oʊr: 'LOWER vowel',
  'oʊ̆ɚ̆': 'LOWER vowel',
  'aɪ̆ə̆': 'FIRE vowel (alternate)',
  'ɪ̆ʊɚ̆': 'triphthong',

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
  'ʰ': 'aspirated',
  'ʷ': 'labialized',
  'ʲ': 'palatalized',
  'ˠ': 'velarized',
  'ˤ': 'pharyngealized',
  '̴': 'velarized or pharyngealized',
  '̝': 'raised',
  '̞': 'lowered',
  '̘': 'advanced tongue root',
  '̙': 'retracted tongue root',

  // Stress
  'ˈ': 'primary stress',
  'ˌ': 'secondary stress',

  // Length
  'ː': 'long',
  'ˑ': 'half-long',
  '̆': 'extra-short',

  // Suprasegmentals
  '|': 'minor (foot) group',
  '‖': 'major (intonation) group',
  '.': 'syllable break',
  '‿': 'linking (absence of break)',
  '-': 'hyphen',

  // Linking
  '͜': 'tie bar above',

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

// Helper to get keyboard shortcut for a symbol
const getSymbolShortcut = (symbol: string): string | null => {
  for (const group of LETTER_GROUPS) {
    const symbolIndex = group.symbols.indexOf(symbol)
    if (symbolIndex !== -1) {
      return `Ctrl+${group.letter.toLowerCase()} ${symbolIndex + 1}x`
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
    'g',
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
  { letter: 'A', symbols: ['a', 'ɑ','ɐ', 'æ', 'ɑ̃'] },
  { letter: 'B', symbols: ['b', 'β', 'ɓ'] },
  { letter: 'C', symbols: ['c', 'ç', 'ɕ'] },
  { letter: 'D', symbols: ['d', 'd͡ʒ', 'ð', 'ɖ', 'ɗ',] },
  { letter: 'E', symbols: ['e', 'ə', 'ɚ', 'ɛ', 'ɞ', 'ɘ'] },
  { letter: 'F', symbols: ['f'] },
  { letter: 'G', symbols: ['g', 'ɡ', 'ɠ', 'ɢ'] },
  { letter: 'H', symbols: ['h', 'ħ', 'ɦ', 'ɥ', 'ʜ', 'ɧ'] },
  { letter: 'I', symbols: ['i', 'ɪ', 'ɨ', 'ï'] },
  { letter: 'J', symbols: ['j', 'ʝ', 'ɟ', 'ʄ'] },
  { letter: 'K', symbols: ['k'] },
  { letter: 'L', symbols: ['l', 'ɬ', 'ɫ', 'ɭ', 'ʟ', 'ɮ'] },
  { letter: 'M', symbols: ['m', 'ɱ', 'ɰ'] },
  { letter: 'N', symbols: ['n', 'ŋ', 'ɲ', 'ɳ', 'ɴ'] },
  { letter: 'O', symbols: ['o', 'ɔ', 'œ', 'ɵ', 'ɔ̃', 'ɒ', 'ø'] },
  { letter: 'P', symbols: ['p', 'ɸ'] },
  { letter: 'Q', symbols: ['q', 'ˈ', 'ˌ'] },
  { letter: 'R', symbols: ['r', 'ɹ', 'ɾ', 'ɻ', 'ʀ', 'ʁ', 'ɽ'] },
  { letter: 'S', symbols: ['s', 'ʃ', 'ʂ'] },
  { letter: 'T', symbols: ['t', 'θ', 'ʈ', 't͡ʃ', 't͡s'] },
  { letter: 'U', symbols: ['u', 'ʊ', 'ʉ', 'ũ'] },
  { letter: 'V', symbols: ['v', 'ʌ', 'ʋ', 'ⱱ'] },
  { letter: 'W', symbols: ['w', 'ʍ', 'ɯ', 'ɰ'] },
  { letter: 'X', symbols: ['x', 'χ'] },
  { letter: 'Y', symbols: ['y', 'ɣ', 'ʏ', 'ʎ', 'ɤ'] },
  { letter: 'Z', symbols: ['z', 'ʒ', 'ʐ', 'ʑ', 'd͡z'] },
  { letter: '2', symbols: ['ʔ', 'ʕ', 'ʡ', 'ʢ'] },
  { letter: '3', symbols: ['ɜ', 'ɝ', 'ɛ̃'] },
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
  { letter: 'Linking', symbols: ['‿', '͜'] },
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
  { letter: 'Length', symbols: ['ː', 'ˑ', '̆'] },
  { letter: 'Suprasegmentals', symbols: ['|', '‖', '.', '‿', '-'] },
]

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
}) => {
  const [text, setText] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const toast = useToast()
  const internalEditorRef = useRef<any>(null)
  const editorRef = externalEditorRef || internalEditorRef

  // Track key presses for T9-style input
  const [keyPressCount, setKeyPressCount] = useState<{ [key: string]: number }>(
    {},
  )
  const [lastKeyTime, setLastKeyTime] = useState<{ [key: string]: number }>({})
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Get filtered symbol groups based on props
  const getFilteredSymbols = () => {
    // If custom symbols provided
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
      // Build compact view from custom symbols only
      return buildGroupsFromSymbols(customSymbols)
    }

    // If filter categories specified
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

    // Default: show all
    return LETTER_GROUPS
  }

  const filteredGroups = getFilteredSymbols()
  const buttonSize = compact ? '35px' : '45px'
  const buttonFontSize = compact ? 'md' : 'lg'
  const spacing = compact ? 1 : 2
  const hideKeyboardShortcuts = false // Always show shortcuts in tooltips

  // T9-style keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl/Cmd is pressed
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase()

        // Find the letter group (including numbers and special keys)
        const letterGroup = filteredGroups.find(
          (group) => group.letter.toLowerCase() === key || group.letter === key,
        )

        if (letterGroup) {
          event.preventDefault()

          const now = Date.now()
          const lastTime = lastKeyTime[key] || 0
          const timeDiff = now - lastTime

          // Clear any existing timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
            setTimeoutId(null)
          }

          // Reset count if more than 1 second has passed (like T9)
          if (timeDiff > 1000) {
            setKeyPressCount((prev) => ({ ...prev, [key]: 0 }))
          }

          // Increment press count
          const newCount =
            ((keyPressCount[key] || 0) + 1) % letterGroup.symbols.length
          setKeyPressCount((prev) => ({ ...prev, [key]: newCount }))
          setLastKeyTime((prev) => ({ ...prev, [key]: now }))

          // Get the symbol at the current count
          const symbol = letterGroup.symbols[newCount]
          setSelectedSymbol(symbol)
          setCurrentSymbol(symbol)

          // If preview callback is provided, use that for cycling feedback
          if (onSymbolPreview) {
            onSymbolPreview(symbol)
          } else if (useRichTextEditor && editorRef.current?.insertSymbol) {
            // For rich text editor, use T9-style cycling
            // Replace if we're still within the 1-second window (timeDiff < 1000)
            const shouldReplace = timeDiff <= 1000
            editorRef.current.insertSymbol(symbol, shouldReplace)
          } else {
            // Otherwise, update text area for visual feedback
            setText((prev) => {
              // Remove the last symbol if it was from the same letter group
              const lastSymbol = prev.slice(-1)
              const isLastSymbolFromSameGroup =
                letterGroup.symbols.includes(lastSymbol)

              if (isLastSymbolFromSameGroup) {
                return prev.slice(0, -1) + symbol
              } else {
                return prev + symbol
              }
            })
          }

          // Set timeout to commit the symbol after 1 second of no activity
          const newTimeoutId = setTimeout(() => {
            // Call onSymbolClick when the symbol is committed (after timeout)
            if (onSymbolClick && symbol) {
              onSymbolClick(symbol)
              // Clear the text since it was sent to the external handler
              if (!onSymbolPreview && !useRichTextEditor) {
                setText('')
              }
            }
            setCurrentSymbol(null)
            setSelectedSymbol(null)
            setTimeoutId(null)
          }, 1000)

          setTimeoutId(newTimeoutId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [
    keyPressCount,
    lastKeyTime,
    onSymbolClick,
    onSymbolPreview,
    timeoutId,
    filteredGroups,
    useRichTextEditor,
    editorRef,
  ])

  const handleSymbolClick = (symbol: string) => {
    if (onSymbolClick) {
      onSymbolClick(symbol)
    } else if (useRichTextEditor && editorRef.current?.insertSymbol) {
      editorRef.current.insertSymbol(symbol)
    } else {
      setText((prev) => prev + symbol)
    }
    setSelectedSymbol(symbol)
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
  }

  return (
    <VStack
      spacing={compact ? 2 : 4}
      align="stretch"
      maxW="1200px"
      mx="auto"
      p={compact ? 2 : 4}
    >
      {!hideInstructions && (
        <Text
          fontSize={compact ? 'lg' : 'xl'}
          fontWeight="bold"
          textAlign="center"
          color="brand.iris"
        >
          {title || 'Acting Accents IPA Keyboard'}
        </Text>
      )}

      {/* Instructions moved to top */}
      {!hideInstructions && (
        <Box
          bg="gray.50"
          p={3}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontSize="sm" color="black">
            <Text as="span" fontWeight="bold">
              Instructions:
            </Text>{' '}
            Click on any symbol to add it to your text.{' '}
            {!compact &&
              'Use T9-style shortcuts: Ctrl+A (1st A symbol), Ctrl+A+A (2nd A symbol), Ctrl+A+A+A (3rd A symbol), etc. Symbols cycle directly in the text area - the last symbol is replaced until you stop pressing or press a different key.'}
          </Text>
        </Box>
      )}

      {/* IPA Symbol Grid - TypeIt Layout */}
      <Box
        border="2px solid"
        borderColor="brand.iris"
        borderRadius="lg"
        p={compact ? 2 : 4}
        bg="white"
      >
        {/* Compact mode - simple symbol list or categorized */}
        {compact && (customSymbols || symbolBankCategories) ? (
          <>
            {showCategoriesInCompact && symbolBankCategories ? (
              // Categorized compact mode with letter badges
              <VStack spacing={3} align="stretch">
                {symbolBankCategories.consonants && symbolBankCategories.consonants.length > 0 && (
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
                        Consonants
                      </Badge>
                      {symbolBankCategories.consonants.map((symbol, index) => {
                        const shortcut = getSymbolShortcut(symbol)
                        const label = shortcut
                          ? `${getSymbolName(symbol)} (${shortcut})`
                          : getSymbolName(symbol)
                        return (
                        <Tooltip key={index} label={label}>
                          <Button
                            size="sm"
                            variant="outline"
                            fontFamily="'Charis SIL', serif"
                            fontSize={buttonFontSize}
                            minW={buttonSize}
                            h={buttonSize}
                            onClick={() => handleSymbolClick(symbol)}
                            _hover={{ bg: 'brand.blueLight' }}
                            bg={selectedSymbol === symbol ? 'brand.blueLight' : 'white'}
                          >
                            {symbol}
                          </Button>
                        </Tooltip>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
                {symbolBankCategories.monophthongs && symbolBankCategories.monophthongs.length > 0 && (
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
                        Monophthongs
                      </Badge>
                      {symbolBankCategories.monophthongs.map((symbol, index) => {
                        const shortcut = getSymbolShortcut(symbol)
                        const label = shortcut
                          ? `${getSymbolName(symbol)} (${shortcut})`
                          : getSymbolName(symbol)
                        return (
                        <Tooltip key={index} label={label}>
                          <Button
                            size="sm"
                            variant="outline"
                            fontFamily="'Charis SIL', serif"
                            fontSize={buttonFontSize}
                            minW={buttonSize}
                            h={buttonSize}
                            onClick={() => handleSymbolClick(symbol)}
                            _hover={{ bg: 'brand.blueLight' }}
                            bg={selectedSymbol === symbol ? 'brand.blueLight' : 'white'}
                          >
                            {symbol}
                          </Button>
                        </Tooltip>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
                {symbolBankCategories.diphthongs && symbolBankCategories.diphthongs.length > 0 && (
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
                      {symbolBankCategories.diphthongs.map((symbol, index) => {
                        const shortcut = getSymbolShortcut(symbol)
                        const label = shortcut
                          ? `${getSymbolName(symbol)} (${shortcut})`
                          : getSymbolName(symbol)
                        return (
                        <Tooltip key={index} label={label}>
                          <Button
                            size="sm"
                            variant="outline"
                            fontFamily="'Charis SIL', serif"
                            fontSize={buttonFontSize}
                            minW={buttonSize}
                            h={buttonSize}
                            onClick={() => handleSymbolClick(symbol)}
                            _hover={{ bg: 'brand.blueLight' }}
                            bg={selectedSymbol === symbol ? 'brand.blueLight' : 'white'}
                          >
                            {symbol}
                          </Button>
                        </Tooltip>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
                {symbolBankCategories.triphthongs && symbolBankCategories.triphthongs.length > 0 && (
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
                      {symbolBankCategories.triphthongs.map((symbol, index) => {
                        const shortcut = getSymbolShortcut(symbol)
                        const label = shortcut
                          ? `${getSymbolName(symbol)} (${shortcut})`
                          : getSymbolName(symbol)
                        return (
                        <Tooltip key={index} label={label}>
                          <Button
                            size="sm"
                            variant="outline"
                            fontFamily="'Charis SIL', serif"
                            fontSize={buttonFontSize}
                            minW={buttonSize}
                            h={buttonSize}
                            onClick={() => handleSymbolClick(symbol)}
                            _hover={{ bg: 'brand.blueLight' }}
                            bg={selectedSymbol === symbol ? 'brand.blueLight' : 'white'}
                          >
                            {symbol}
                          </Button>
                        </Tooltip>
                        )
                      })}
                    </Flex>
                  </Box>
                )}
                {symbolBankCategories.diacritics && symbolBankCategories.diacritics.length > 0 && (
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
                        Diacritics
                      </Badge>
                      {symbolBankCategories.diacritics.map((symbol, index) => {
                        const shortcut = getSymbolShortcut(symbol)
                        const label = shortcut
                          ? `${getSymbolName(symbol)} (${shortcut})`
                          : getSymbolName(symbol)
                        return (
                        <Tooltip key={index} label={label}>
                          <Button
                            size="sm"
                            variant="outline"
                            fontFamily="'Charis SIL', serif"
                            fontSize={buttonFontSize}
                            minW={buttonSize}
                            h={buttonSize}
                            onClick={() => handleSymbolClick(symbol)}
                            _hover={{ bg: 'brand.blueLight' }}
                            bg={selectedSymbol === symbol ? 'brand.blueLight' : 'white'}
                          >
                            {symbol}
                          </Button>
                        </Tooltip>
                        )
                      })}
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
                      fontFamily="'Charis SIL', serif"
                      fontSize={buttonFontSize}
                      minW={buttonSize}
                      h={buttonSize}
                      onClick={() => handleSymbolClick(symbol)}
                      _hover={{ bg: 'brand.blueLight' }}
                      bg={selectedSymbol === symbol ? 'brand.blueLight' : 'white'}
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
            <Flex wrap="wrap" gap={2}>
              {filteredGroups
                .filter(
                  (group) =>
                    group.symbols.length > 0 &&
                    !['Linking', 'Diacritics', 'Tones', 'Length', 'Suprasegmentals'].includes(group.letter)
                )
                .map((group) => (
                  <Box
                    key={group.letter}
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                    minW="fit-content"
                  >
                    <Flex align="center" gap={2}>
                      {!hideKeyboardShortcuts && (
                        <Tooltip
                          label={`Ctrl+${group.letter.toLowerCase()} - Press multiple times to cycle`}
                        >
                          <Badge
                            colorScheme="purple"
                            fontSize="md"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {group.letter}
                          </Badge>
                        </Tooltip>
                      )}
                      <HStack spacing={1}>
                        {group.symbols.map((symbol, idx) => (
                          <Tooltip
                            key={idx}
                            label={
                              hideKeyboardShortcuts
                                ? `${symbol} - ${getSymbolName(symbol)}`
                                : `${symbol} - ${getSymbolName(symbol)} (Ctrl+${group.letter.toLowerCase()} ${
                                    idx + 1
                                  }x)`
                            }
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              fontFamily="'Charis SIL', serif"
                              fontSize={buttonFontSize}
                              minW={buttonSize}
                              h={buttonSize}
                              onClick={() => handleSymbolClick(symbol)}
                              _hover={{ bg: 'brand.blueLight' }}
                              bg={
                                selectedSymbol === symbol
                                  ? 'brand.blueLight'
                                  : 'white'
                              }
                            >
                              {symbol}
                            </Button>
                          </Tooltip>
                        ))}
                      </HStack>
                    </Flex>
                  </Box>
                ))}
            </Flex>

            {/* Additional Symbol Rows - Collapsible */}
            {!compact && (
              <Accordion allowToggle mt={4}>
                <AccordionItem border="none">
                  <AccordionButton
                    bg="gray.100"
                    borderRadius="md"
                    _hover={{ bg: 'gray.200' }}
                    px={4}
                    py={2}
                  >
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      Advanced Symbols (Diacritics, Tones, etc.)
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} pt={3}>
                    <Flex wrap="wrap" gap={2}>
                      {[
                        'Diacritics',
                        'Linking',
                        'Tones',
                        'Length',
                        'Suprasegmentals',
                      ].map((letter) => {
                        const group = filteredGroups.find(
                          (g) => g.letter === letter,
                        )
                        if (!group || group.symbols.length === 0) return null
                        return (
                          <Box
                            key={letter}
                            bg="blue.50"
                            p={2}
                            borderRadius="md"
                            minW="fit-content"
                          >
                            <Flex align="center" gap={2}>
                              <Badge
                                colorScheme="purple"
                                fontSize="sm"
                                px={2}
                                py={1}
                                borderRadius="md"
                              >
                                {letter}
                              </Badge>
                              <HStack spacing={1} flexWrap="wrap">
                                {group.symbols.map((symbol, idx) => (
                                  <Tooltip
                                    key={idx}
                                    label={`${symbol} - ${getSymbolName(symbol)} (${letter})`}
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      fontFamily="'Charis SIL', serif"
                                      fontSize={buttonFontSize}
                                      minW={buttonSize}
                                      h={buttonSize}
                                      onClick={() => handleSymbolClick(symbol)}
                                      _hover={{ bg: 'brand.blueLight' }}
                                      bg={
                                        selectedSymbol === symbol
                                          ? 'brand.blueLight'
                                          : 'white'
                                      }
                                    >
                                      {symbol}
                                    </Button>
                                  </Tooltip>
                                ))}
                              </HStack>
                            </Flex>
                          </Box>
                        )
                      })}
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
        <>
          {useRichTextEditor ? (
            <RichTextIPAEditor
              ref={editorRef}
              onSymbolInsert={(symbol) => {
                if (onSymbolClick) {
                  onSymbolClick(symbol)
                }
                setSelectedSymbol(symbol)
              }}
              placeholder="Type or click symbols to create IPA transcription..."
              minHeight="200px"
              maxHeight="500px"
            />
          ) : (
            <Box
              border="2px solid"
              borderColor="brand.iris"
              borderRadius="lg"
              p={4}
              bg="white"
              position="relative"
            >
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or click symbols to create IPA transcription..."
                fontFamily="'Charis SIL', serif"
                fontSize="lg"
                minH="100px"
                resize="vertical"
                border="1px solid"
                borderColor="gray.300"
                _focus={{ borderColor: 'brand.iris' }}
                pr="100px" // Make room for buttons
              />
              {/* Action buttons positioned inside textarea */}
              <Flex
                position="absolute"
                top="6"
                right="6"
                gap={1}
              >
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
        </>
      )}
    </VStack>
  )
}

export default IPAKeyboard
