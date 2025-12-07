// Utility functions for detecting and extracting IPA symbols from quiz data

export const extractSymbolsFromQuiz = (quizData: any): string[] => {
  const symbols = new Set<string>()

  // From questions (text field often contains the symbol)
  quizData.questions?.forEach((q: any) => {
    if (isIPASymbol(q.text)) {
      symbols.add(q.text)
    }
  })

  // From answer options (optionText)
  quizData.questions?.forEach((q: any) => {
    q.answerOptions?.forEach((opt: any) => {
      const extractedSymbols = extractIPAFromText(opt.optionText)
      extractedSymbols.forEach((sym) => symbols.add(sym))
    })
    q.extraOptions?.forEach((opt: any) => {
      const extractedSymbols = extractIPAFromText(opt.optionText)
      extractedSymbols.forEach((sym) => symbols.add(sym))
    })
  })

  return Array.from(symbols)
}

const isIPASymbol = (text: string): boolean => {
  // IPA symbols are typically 1-3 characters with special unicode
  return text.length <= 3 && /[\u0250-\u02AF\u0300-\u036F]/.test(text)
}

const extractIPAFromText = (text: string): string[] => {
  // Match IPA symbols within text
  const ipaPattern = /[\u0250-\u02AF\u0300-\u036F]+/g
  return text.match(ipaPattern) || []
}

export const categorizeSymbols = (
  symbols: string[],
): {
  vowels: string[]
  consonants: string[]
  diphthongs: string[]
  triphthongs: string[]
  other: string[]
} => {
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
  const DIPHTHONGS = [
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
  ]
  const TRIPHTHONGS = [
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
  ]

  const categorized = {
    vowels: [] as string[],
    consonants: [] as string[],
    diphthongs: [] as string[],
    triphthongs: [] as string[],
    other: [] as string[],
  }

  symbols.forEach((symbol) => {
    if (TRIPHTHONGS.includes(symbol)) {
      categorized.triphthongs.push(symbol)
    } else if (DIPHTHONGS.includes(symbol)) {
      categorized.diphthongs.push(symbol)
    } else if (VOWELS.includes(symbol)) {
      categorized.vowels.push(symbol)
    } else if (CONSONANTS.includes(symbol)) {
      categorized.consonants.push(symbol)
    } else {
      categorized.other.push(symbol)
    }
  })

  return categorized
}

export const getSymbolBankFromQuiz = (quizData: any): string[] => {
  // If quiz has explicit symbolBank or availableSymbols, use that
  if (quizData.symbolBank && Array.isArray(quizData.symbolBank)) {
    return quizData.symbolBank
  }
  if (quizData.availableSymbols && Array.isArray(quizData.availableSymbols)) {
    return quizData.availableSymbols
  }
  if (quizData.availableVowels && Array.isArray(quizData.availableVowels)) {
    return quizData.availableVowels
  }

  // Otherwise, extract from question data
  return extractSymbolsFromQuiz(quizData)
}
