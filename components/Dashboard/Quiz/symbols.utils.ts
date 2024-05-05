const vowelWords = [
  { symbol: 'i', words: ['feed', 'chief', 'nifty', 'machine'] },
  { symbol: 'ɪ', words: ['chill', 'think', 'mischief'] },
  { symbol: 'ɛ', words: ['scent', 'sweat', 'measure'] },
  { symbol: 'æ', words: ['black', 'champion', 'asterisk'] },
  { symbol: 'ɑ', words: ['blot', 'option', 'auto'] },
  { symbol: 'ʌ', words: ['bunny', 'loving', 'trunk'] },
  { symbol: 'ʊ', words: ['put', 'should', 'wood'] },
  { symbol: 'u', words: ['blue', 'screw', 'move'] },
  { symbol: 'ə', words: ['amaze', 'llama', 'unnecessary'] },
  { symbol: 'ɚ', words: ['caller', 'perceive', 'earner'] },
  { symbol: 'ɝ', words: ['purse', 'surf', 'learn'] },
]

const consonantWords = [
  { symbol: 'p', words: ['pretty', 'stop'] },
  { symbol: 'b', words: ['babe', 'club'] },
  { symbol: 'm', words: ['mist', 'comb'] },
  { symbol: 'f', words: ['offer', 'sift'] },
  { symbol: 'v', words: ['oven', 'vain'] },
  { symbol: 't', words: ['tire', 'bait'] },
  { symbol: 'd', words: ['dead', 'adorn'] },
  { symbol: 'n', words: ['noon', 'win'] },
  { symbol: 'ɾ', words: ['patting', 'hearty'] },
  { symbol: 'θ', words: ['fourth', 'think'] },
  { symbol: 'ð', words: ['breathe', 'bother'] },
  { symbol: 's', words: ['suspect', 'cent'] },
  { symbol: 'z', words: ['scissors', 'cheese'] },
  { symbol: 'ʃ', words: ['shush', 'ocean'] },
  { symbol: 'ʒ', words: ['garage', 'measure'] },
  { symbol: 'ɹ', words: ['bring', 'arrange'] },
  { symbol: 'l', words: ['lily', 'mellow'] },
  { symbol: 'j', words: ['yelp', 'uniform'] },
  { symbol: 'k', words: ['crack', 'scheme'] },
  { symbol: 'g', words: ['gurgle', 'green'] },
  { symbol: 'ŋ', words: ['tongue', 'think'] },
  { symbol: 'ʔ', words: ['curtain', 'uh-oh'] },
  { symbol: 'h', words: ['hoist', 'behemoth'] },
  { symbol: 'ç', words: ['inhumane', 'hubris'] },
  { symbol: 'w', words: ['one', 'inward'] },
  { symbol: 't͡ʃ', words: ['church', 'itchy'] },
  { symbol: 'd͡ʒ', words: ['judge', 'gerbil'] },
  { symbol: 'ɫ', words: ['pull', 'tilt'] },
]

export const complexConsonantClusters = [
  { symbol: 'aɪ̆', words: ['fly', 'island'] },
  { symbol: 'eɪ̆', words: ['pray', 'angel'] },
  { symbol: 'ɔɪ̆', words: ['employ', 'broil'] },
  { symbol: 'ɪ̆u', words: ['music', 'beauty'] },
  { symbol: 'oʊ̆', words: ['though', 'mow'] },
  { symbol: 'ɑɚ̆', words: ['park', 'margin'] },
  { symbol: 'ɛɚ̆', words: ['ensnare', 'fair'] },
  { symbol: 'ɪɚ̆', words: ['clear', 'steer'] },
  { symbol: 'ɔɚ̆', words: ['chord', 'implore'] },
  { symbol: 'ʊɚ̆', words: ['cure', 'manure'] },
  { symbol: 'aɪ̆ɚ̆', words: ['pyer', 'shier'] },
  { symbol: 'aɪ̆ə̆', words: ['giant', 'bias'] },
  { symbol: 'aʊ̆ɚ̆', words: ['hour', 'flour'] },
  { symbol: 'ɔɪ̆ɚ̆', words: ['Sawyer', 'lawyer'] },
  { symbol: 'ɪ̆ʊɚ̆', words: ['impure'] },
  { symbol: 'ɛɪ̆ɚ̆', words: ['soothsayer'] },
  { symbol: 'oʊ̆ɚ̆', words: ['grower'] },
]

export function getQuizItems(lessonType: string) {
  if (lessonType.includes('Vowels')) {
    return consonantWords
  } else if (lessonType.includes('Consonants')) {
    return vowelWords
  } else {
    return complexConsonantClusters
  }
}
