// Author the `{...}` underline markup for the three "in Word Context" quizzes.
//
// Those exercises tell the learner to "select the IPA symbol that corresponds
// with the underlined part of the word" — but not one of the 124 words carried
// any markup, so nothing was underlined and the learner had to guess which
// segment was being tested. The renderer (components/.../UnderlineMarkup.tsx)
// has always supported `{...}`; only the content was missing.
//
// Convention, set by the "shush" note from the 29 Aug review: underline EVERY
// occurrence of the target sound in the word, not just the first. So /ʃ/ in
// "shush" is {sh}u{sh}, and /b/ in "babe" is {b}a{b}e.
//
// The markup is keyed by (symbol, word) rather than by word alone, because the
// same word appears under different symbols and must be marked differently:
//   "think" is {th}ink for /θ/, thi{n}k for /ŋ/, and th{i}nk for /ɪ/.
//
// Every entry is checked: stripping the braces must return the stored word
// exactly, and every word in the three quizzes must have an entry. The script
// refuses to write if either check fails.
//
// Run: node scripts/add-underline-markup.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED = join(__dirname, '..', 'prisma', 'seed-data.json')
const DRY = process.argv.includes('--dry-run')
const QUIZZES = [8, 9, 11]

// symbol -> { word: markedUpWord }
const MARKUP = {
  // ---- 5E consonants -------------------------------------------------
  p: { pretty: '{p}retty', stop: 'sto{p}' },
  b: { babe: '{b}a{b}e', club: 'clu{b}' },
  m: { mist: '{m}ist', comb: 'co{m}b' },
  f: { offer: 'o{ff}er', sift: 'si{f}t' },
  v: { vain: '{v}ain', of: 'o{f}' },
  t: { tire: '{t}ire', bait: 'bai{t}' },
  d: { dead: '{d}ea{d}', adorn: 'a{d}orn' },
  n: { noon: '{n}oo{n}', win: 'wi{n}' },
  ɾ: { patting: 'pa{tt}ing', hearty: 'hear{t}y' },
  θ: { fourth: 'four{th}', think: '{th}ink' },
  ð: { breathe: 'brea{th}e', bother: 'bo{th}er' },
  s: { suspect: '{s}u{s}pect', cent: '{c}ent' },
  z: { scissors: 'sci{ss}or{s}', cheese: 'chee{s}e' },
  ʃ: { shush: '{sh}u{sh}', ocean: 'o{ce}an' },
  ʒ: { garage: 'gara{g}e', measure: 'mea{s}ure' },
  ɹ: { bring: 'b{r}ing', arrange: 'a{rr}ange' },
  l: { lily: '{l}i{l}y', mellow: 'me{ll}ow' },
  j: { yelp: '{y}elp', uniform: '{u}niform' },
  k: { crack: '{c}ra{ck}', scheme: 's{ch}eme' },
  g: { gurgle: '{g}ur{g}le', green: '{g}reen' },
  ŋ: { tongue: 'to{ng}ue', think: 'thi{n}k' },
  ʔ: { curtain: 'cur{t}ain', 'uh-oh': 'uh{-}oh' },
  h: { hoist: '{h}oist', behave: 'be{h}ave' },
  ç: { inhumane: 'in{h}umane', hubris: '{h}ubris' },
  w: { one: '{o}ne', inward: 'in{w}ard' },
  t͡ʃ: { church: '{ch}ur{ch}', itchy: 'i{tch}y' },
  d͡ʒ: { judge: '{j}u{dge}', gerbil: '{g}erbil' },
  ɫ: { pull: 'pu{ll}', tilt: 'ti{l}t' },

  // ---- 6E monophthongs -----------------------------------------------
  i: {
    feed: 'f{ee}d',
    chief: 'ch{ie}f',
    nifty: 'nift{y}',
    machine: 'mach{i}ne',
  },
  ɪ: { chill: 'ch{i}ll', think: 'th{i}nk', mischief: 'm{i}sch{ie}f' },
  ɛ: { scent: 'sc{e}nt', sweat: 'sw{ea}t', measure: 'm{ea}sure' },
  æ: { black: 'bl{a}ck', champion: 'ch{a}mpion', asterisk: '{a}sterisk' },
  ɑ: { blot: 'bl{o}t', option: '{o}ption', auto: '{au}to' },
  ʌ: { bunny: 'b{u}nny', loving: 'l{o}ving', trunk: 'tr{u}nk' },
  ʊ: { put: 'p{u}t', should: 'sh{ou}ld', wood: 'w{oo}d' },
  u: { blue: 'bl{ue}', screw: 'scr{ew}', move: 'm{o}ve' },
  ə: { amaze: '{a}maze', llama: 'llam{a}', famous: 'fam{ou}s' },
  ɚ: { caller: 'call{er}', perceive: 'p{er}ceive', earner: 'earn{er}' },
  ɝ: { purse: 'p{ur}se', world: 'w{or}ld', learn: 'l{ear}n' },

  // ---- 7D diphthongs & triphthongs -----------------------------------
  aɪ̆: { fly: 'fl{y}', island: '{i}sland' },
  eɪ̆: { pray: 'pr{ay}', angel: '{a}ngel' },
  ɔɪ̆: { employ: 'empl{oy}', broil: 'br{oi}l' },
  ɪ̆u: { music: 'm{u}sic', beauty: 'b{eau}ty' },
  oʊ̆: { though: 'th{ough}', mow: 'm{ow}' },
  ɑɚ̆: { park: 'p{ar}k', margin: 'm{ar}gin' },
  ɛɚ̆: { ensnare: 'ensn{are}', fair: 'f{air}' },
  ɪɚ̆: { clear: 'cl{ear}', steer: 'st{eer}' },
  ɔɚ̆: { chord: 'ch{or}d', implore: 'impl{ore}' },
  ʊɚ̆: { cure: 'c{ure}', manure: 'man{ure}' },
  aɪ̆ɚ̆: { pyre: 'p{yre}', shire: 'sh{ire}' },
  aɪ̆ə̆: { giant: 'g{ia}nt', bias: 'b{ia}s' },
  aʊ̆ɚ̆: { hour: 'h{our}', flour: 'fl{our}' },
  ɔɪ̆ɚ̆: { Sawyer: 'S{awyer}', lawyer: 'l{awyer}' },
  ɪ̆ʊɚ̆: { demure: 'dem{ure}', impure: 'imp{ure}' },
  ɛɪ̆ɚ̆: { soothsayer: 'sooths{ayer}', 'they’re': 'th{ey’re}' },
  oʊ̆ɚ̆: { grower: 'gr{ower}', sewer: 's{ewer}' },
}

const nfc = (s) => s.normalize('NFC')
const strip = (s) => s.replace(/[{}]/g, '')

const data = JSON.parse(readFileSync(SEED, 'utf-8'))
const questions = new Map(data.Question.map((q) => [q.id, q]))

// Index the authored table under NFC so combining marks always match.
const table = {}
for (const [symbol, words] of Object.entries(MARKUP)) {
  table[nfc(symbol)] = Object.fromEntries(
    Object.entries(words).map(([w, m]) => [nfc(w), m]),
  )
}

const errors = []
const plan = []
for (const opt of data.AnswerOption) {
  const q = questions.get(opt.questionId)
  if (!q || !QUIZZES.includes(q.quizId)) continue
  if (opt.optionText.includes('{')) continue // already marked up

  const symbol = nfc(q.text)
  const word = nfc(opt.optionText)
  const marked = table[symbol]?.[word]

  if (!marked) {
    errors.push(`no markup authored for /${q.text}/ + "${opt.optionText}"`)
    continue
  }
  // The marks must be purely additive — never alter the word itself.
  if (nfc(strip(marked)) !== word) {
    errors.push(
      `markup changes the word: "${opt.optionText}" -> "${strip(marked)}"`,
    )
    continue
  }
  if (!marked.includes('{')) {
    errors.push(`markup underlines nothing: "${opt.optionText}"`)
    continue
  }
  plan.push({ id: opt.id, symbol: q.text, from: opt.optionText, to: marked })
}

if (errors.length) {
  console.error(`REFUSING TO WRITE — ${errors.length} problem(s):`)
  errors.forEach((e) => console.error(`  ${e}`))
  process.exit(1)
}

const byOpt = new Map(data.AnswerOption.map((o) => [o.id, o]))
for (const p of plan) byOpt.get(p.id).optionText = p.to

console.log(`${plan.length} words marked up:`)
for (const p of plan) console.log(`  /${p.symbol}/  ${p.to}`)

if (DRY) {
  console.log('\n--dry-run: nothing written')
} else {
  writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n')
  console.log('\nwritten to prisma/seed-data.json — run `yarn seed` to apply')
}
