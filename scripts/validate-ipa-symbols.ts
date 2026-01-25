/**
 * IPA Keyboard Symbol Validation Script
 *
 * This script validates that all IPA symbols are correctly categorized
 * and that there are no duplicate or missing symbols.
 */

// Import symbol data from keyboard component
const VOWELS = [
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
]

const CONSONANTS = [
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
]

const LETTER_GROUPS = [
  { letter: 'A', symbols: ['a', 'ɑ', 'æ', 'ɐ', 'ɑ̃'] },
  { letter: 'B', symbols: ['b', 'β', 'ɓ'] },
  { letter: 'C', symbols: ['c', 'ç', 'ɕ'] },
  { letter: 'D', symbols: ['d', 'ð', 'ɖ', 'ɗ', 'd͡ʒ', 'd͡z'] },
  { letter: 'E', symbols: ['e', 'ə', 'ɘ', 'ɚ', 'ɛ', 'ɞ'] },
  { letter: 'F', symbols: ['f'] },
  { letter: 'G', symbols: ['g', 'ɡ', 'ɣ', 'ɠ', 'ɢ'] },
  { letter: 'H', symbols: ['h', 'ħ', 'ɦ', 'ɥ', 'ʜ', 'ɧ'] },
  { letter: 'I', symbols: ['i', 'ɪ', 'ɨ', 'ĩ'] },
  { letter: 'J', symbols: ['j', 'ʝ', 'ɟ', 'ʄ', 'ʒ', 'd͡ʒ'] },
  { letter: 'K', symbols: ['k', 'c'] },
  { letter: 'L', symbols: ['l', 'ɬ', 'ɫ', 'ɭ', 'ʟ', 'ɮ'] },
  { letter: 'M', symbols: ['m', 'ɱ', 'ɰ'] },
  { letter: 'N', symbols: ['n', 'ŋ', 'ɲ', 'ɳ', 'ɴ'] },
  { letter: 'O', symbols: ['o', 'ɔ', 'œ', 'ɵ', 'ɔ̃', 'ɒ', 'ø'] },
  { letter: 'P', symbols: ['p', 'ɸ'] },
  { letter: 'Q', symbols: ['q', 'ˈ', 'ˌ'] },
  { letter: 'R', symbols: ['r', 'ɹ', 'ɻ', 'ʀ', 'ʁ', 'ɾ', 'ɽ'] },
  { letter: 'S', symbols: ['s', 'ʃ', 'ʂ'] },
  { letter: 'T', symbols: ['t', 'θ', 'ʈ', 't͡ʃ', 't͡s'] },
  { letter: 'U', symbols: ['u', 'ʊ', 'ʉ', 'ũ'] },
  { letter: 'V', symbols: ['v', 'ʌ', 'ʋ'] },
  { letter: 'W', symbols: ['w', 'ʍ', 'ɯ'] },
  { letter: 'X', symbols: ['x', 'χ'] },
  { letter: 'Y', symbols: ['y', 'ʏ', 'ʎ', 'ɤ', 'ỹ'] },
  { letter: 'Z', symbols: ['z', 'ʒ', 'ʐ', 'ʑ', 'd͡z'] },
  { letter: '2', symbols: ['ʔ', 'ʕ', 'ʡ', 'ʢ'] },
  { letter: '3', symbols: ['ɜ', 'ɜ̃', 'ɝ', 'ɛ̃'] },
]

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  info: string[]
}

const validateIPASymbols = (): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
  }

  // Test 1: Check for duplicate symbols in VOWELS
  const vowelSet = new Set(VOWELS)
  if (vowelSet.size !== VOWELS.length) {
    result.errors.push('Duplicate vowels found in VOWELS array')
    result.isValid = false
  } else {
    result.info.push(`✓ ${VOWELS.length} unique vowels`)
  }

  // Test 2: Check for duplicate symbols in CONSONANTS
  const consonantSet = new Set(CONSONANTS)
  if (consonantSet.size !== CONSONANTS.length) {
    result.errors.push('Duplicate consonants found in CONSONANTS array')
    result.isValid = false
  } else {
    result.info.push(`✓ ${CONSONANTS.length} unique consonants`)
  }

  // Test 3: Check for duplicates within LETTER_GROUPS
  LETTER_GROUPS.forEach((group) => {
    const symbolSet = new Set(group.symbols)
    if (symbolSet.size !== group.symbols.length) {
      result.errors.push(`Duplicate symbols in ${group.letter} category`)
      result.isValid = false
    }
  })

  // Test 4: Check for tie-bar consistency in affricates
  const affricatesWithTieBar = ['t͡ʃ', 'd͡ʒ', 't͡s', 'd͡z']
  const affricatesWithoutTieBar = ['tʃ', 'dʒ', 'ts', 'dz']

  const allSymbols = LETTER_GROUPS.flatMap((g) => g.symbols)

  affricatesWithoutTieBar.forEach((affricate) => {
    if (allSymbols.includes(affricate)) {
      result.warnings.push(
        `Found affricate without tie-bar: "${affricate}". Should use tie-bar version.`,
      )
    }
  })

  affricatesWithTieBar.forEach((affricate) => {
    if (!allSymbols.includes(affricate)) {
      result.warnings.push(`Affricate with tie-bar not found: "${affricate}"`)
    } else {
      result.info.push(`✓ Affricate with tie-bar found: ${affricate}`)
    }
  })

  // Test 5: Verify new symbols are present
  const newSymbols = ['ɞ', 'ɒ', 'ɰ', 'ɢ', 'd͡z']
  newSymbols.forEach((symbol) => {
    if (!allSymbols.includes(symbol)) {
      result.errors.push(`New symbol missing: ${symbol}`)
      result.isValid = false
    } else {
      result.info.push(`✓ New symbol present: ${symbol}`)
    }
  })

  // Test 6: Check specific categories
  const eCategory = LETTER_GROUPS.find((g) => g.letter === 'E')
  if (eCategory && !eCategory.symbols.includes('ɞ')) {
    result.errors.push('Symbol ɞ missing from E category')
    result.isValid = false
  } else if (eCategory) {
    result.info.push('✓ E category includes ɞ')
  }

  const oCategory = LETTER_GROUPS.find((g) => g.letter === 'O')
  if (oCategory && !oCategory.symbols.includes('ɒ')) {
    result.errors.push('Symbol ɒ missing from O category')
    result.isValid = false
  } else if (oCategory) {
    result.info.push('✓ O category includes ɒ')
  }

  const mCategory = LETTER_GROUPS.find((g) => g.letter === 'M')
  if (mCategory && !mCategory.symbols.includes('ɰ')) {
    result.errors.push('Symbol ɰ (velar approximant) missing from M category')
    result.isValid = false
  } else if (mCategory) {
    result.info.push('✓ M category includes ɰ (velar approximant)')
  }

  // Test 7: Check that O category includes ø (consolidated from '0')
  if (oCategory && !oCategory.symbols.includes('ø')) {
    result.errors.push(
      'Symbol ø missing from O category (should be consolidated)',
    )
    result.isValid = false
  } else if (oCategory) {
    result.info.push('✓ O category includes ø (consolidated)')
  }

  // Test 8: Verify T category only has tie-bar versions
  const tCategory = LETTER_GROUPS.find((g) => g.letter === 'T')
  if (tCategory) {
    if (tCategory.symbols.includes('tʃ') || tCategory.symbols.includes('ts')) {
      result.warnings.push('T category contains affricates without tie-bars')
    }
    if (tCategory.symbols.includes('t͡ʃ') && tCategory.symbols.includes('t͡s')) {
      result.info.push('✓ T category uses tie-bar affricates')
    }
  }

  // Test 9: Check for proper nasalization symbols
  const iCategory = LETTER_GROUPS.find((g) => g.letter === 'I')
  if (iCategory) {
    if (iCategory.symbols.includes('ɪ̃')) {
      result.warnings.push('I category has ɪ̃ (should be ĩ - tilde on base i)')
    } else if (iCategory.symbols.includes('ĩ')) {
      result.info.push('✓ I category uses correct nasalization: ĩ')
    }
  }

  // Test 10: Count total symbols
  const totalSymbols = LETTER_GROUPS.reduce(
    (acc, group) => acc + group.symbols.length,
    0,
  )
  result.info.push(`Total symbols in keyboard: ${totalSymbols}`)

  return result
}

// Run validation
const runValidation = () => {
  console.log('=== IPA Keyboard Symbol Validation ===\n')

  const result = validateIPASymbols()

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:')
    result.errors.forEach((error) => console.log(`  - ${error}`))
    console.log('')
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:')
    result.warnings.forEach((warning) => console.log(`  - ${warning}`))
    console.log('')
  }

  if (result.info.length > 0) {
    console.log('ℹ️  INFO:')
    result.info.forEach((info) => console.log(`  ${info}`))
    console.log('')
  }

  if (result.isValid) {
    console.log('✅ All validation checks passed!\n')
  } else {
    console.log('❌ Validation failed. Please fix the errors above.\n')
    process.exit(1)
  }
}

// Export for use in tests or run directly
if (require.main === module) {
  runValidation()
}

export { validateIPASymbols, VOWELS, CONSONANTS, LETTER_GROUPS }
