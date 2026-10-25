# IPA symbol notation — canonical form

**Status:** decided 2026-09-06 by Jordan + Claude, _pending Krista's review_.
Krista was not available when this was settled; anything in "Open questions"
below is explicitly hers to overrule.

## Why this exists

The same phoneme is spelled three different ways across the project: in the
database question text, in the symbol banks in `public/*.json`, and in the S3
audio filenames. Nothing could match a recording to a question by name, so 7C's
symbol questions sat silent even though their clips were on S3 the whole time.

## Where audio belongs — the rule

**Attach audio only where the exercise's own on-screen instruction tells the
learner to play it.** 7C part 2 says «Click the "Play Audio" button to hear the
symbol», so its symbol questions have audio.

The three `symbolPicker` "in Word Context" exercises (quizzes 8, 9, 11) say only
«Select the IPA symbol that corresponds with the underlined part of the word».
They get **no** audio. Beyond the instruction not offering it, the recording for
one of those questions _is_ the sound the learner is being asked to identify, so
a play button would hand over the answer. If that ever changes, the instruction
text has to change first.

## The notation rule

**Canonical = the spelling used in the database and the `public/*.json` symbol
banks** — i.e. what a learner actually sees on screen and is taught to type.
Audio filenames are mapped _to_ it. Concretely:

1. Every non-syllabic element of a glide carries the breve — `aʊ̆ɚ̆`, not `aʊɚ̆`.
2. No dot separators inside a single vowel cluster — `oʊ̆ɚ̆`, not `oʊ̆.ɚ̆`.
3. The KIT vowel is `ɪ` (small capital I), never `ĭ` (breve i). In this course
   the breve means "non-syllabic element of a glide"; using it for KIT collides
   with that meaning.
4. Affricates use the tie bar: `t͡ʃ`, `d͡ʒ`.
5. Compare symbols after Unicode NFC normalisation. Combining marks (breve
   U+0306) can be encoded more than one way and will silently fail to match.

## We do not rename S3 objects

Existing URLs in the database already point at the current filenames. Renaming
would break them for no benefit. Instead the mismatches live in one variant
table (`VARIANTS` in the attach script), which maps canonical → known filename
spellings:

| Canonical | Filename(s) on S3 | Where                     |
| --------- | ----------------- | ------------------------- |
| `ɪ`       | `ĭ`               | every symbol audio folder |
| `aʊ̆ɚ̆`     | `aʊɚ̆`             | `7D.Audio`                |
| `ɛɪ̆ɚ̆`     | `eɪ̆.ɚ̆`            | `7D.Audio`                |
| `oʊ̆ɚ̆`     | `oʊ̆.ɚ̆`            | `7D.Audio`                |

The `ɪ` ↔ `ĭ` mapping was not guessed. Both `6B.Audio` and `6E.Audio` hold
exactly 11 files for the 11 monophthongs; in each folder the only file with no
matching symbol is `ĭ` and the only symbol with no matching file is `ɪ`. Two
independent folders agree, so the mapping is forced.

## Which audio folder belongs to which exercise

The module letter suffix is the join key. It is consistent across modules 5–7:

| Module                     | Chart / builder | Match the Symbol                | In Word Context            |
| -------------------------- | --------------- | ------------------------------- | -------------------------- |
| 5 Consonants               | `5B.Audio`      | `5D.Audio`                      | _(none — uses `5B.Audio`)_ |
| 6 Vowels                   | `6B.Audio`      | `6D.Audio`                      | `6E.Audio`                 |
| 7 Diphthongs & Triphthongs | `7B.Audio`      | `Diphthongs & Triphtongs/audio` | `7D.Audio`                 |

Module 7 has no PDF at the `B` position, so its letters run one ahead of 5 and
6 — its "in Word Context" audio is `7D`, not `7E`. Module 5 has no dedicated
word-context folder, so its word-context symbols are covered by the 28 clips in
`5B.Audio` (same phonemes, same recordings).

This table is a reference for what exists, **not** a list of what to attach —
only `Diphthongs & Triphtongs/audio` is wired up today. See the rule above.

## Underline markup in the word-context quizzes

All 124 words in quizzes 8, 9 and 11 now carry `{...}` markup, authored in
`scripts/add-underline-markup.mjs`. Two conventions:

- **Underline every occurrence of the target sound**, not just the first — the
  rule set by the "shush" note in the 29 Aug review. So /ʃ/ in "shush" is
  `{sh}u{sh}` and /b/ in "babe" is `{b}a{b}e`.
- **Mark the letters that spell the sound**, so silent letters stay outside the
  underline: /m/ in "comb" is `co{m}b`.

The script keys markup by (symbol, word), because the same word is marked
differently under different symbols — "think" is `{th}ink` for /θ/, `thi{n}k`
for /ŋ/ and `th{i}nk` for /ɪ/. It refuses to write unless every word has an
entry and every entry strips back to the stored word character-for-character.

### Judgement calls worth a second opinion

These are the ones where the sound has no clean one-to-one spelling. All are
defensible, none are obvious:

| Word          | Sound | Marked as      | Why it is arguable                                                      |
| ------------- | ----- | -------------- | ----------------------------------------------------------------------- |
| uh-oh         | /ʔ/   | `uh{-}oh`      | The glottal stop isn't written at all; the hyphen is standing in for it |
| one           | /w/   | `{o}ne`        | The /w/ is an onglide with no `w` in the spelling                       |
| uniform       | /j/   | `{u}niform`    | The /j/ is the onset of the `u`, not a separate letter                  |
| ocean         | /ʃ/   | `o{ce}an`      | `ce` spells /ʃ/ only in this environment                                |
| comb          | /m/   | `co{m}b`       | Silent `b` left outside — consistent with the rule above                |
| Sawyer/lawyer | /ɔɪ̆ɚ̆/ | `S{awyer}`     | The triphthong spans the whole rime                                     |
| mischief      | /ɪ/   | `m{i}sch{ie}f` | Assumes both vowels are /ɪ/ in the taught form                          |

## Open questions for Krista

1. **`aɪ̆ə̆` has no recording anywhere** — not in Drive, not on S3. It is the one
   symbol question in 7C still without a play button. Needs Scott at a mic.
2. **`aʊ̆` (MOUTH) is missing from the 7D word-context quiz.** `7D.Audio`
   contains 17 recordings and the quiz has 17 questions, but they are not the
   same 17: the folder has `aʊ̆` and no `aɪ̆ə̆`; the quiz has `aɪ̆ə̆` and no `aʊ̆`.
   Since MOUTH is one of the core GenAm diphthongs and _is_ covered in the 7C
   match quiz, its absence here looks like a content error rather than a choice
   — but that is a curriculum call, so nothing was changed. (This is about the
   question set, not audio; 7D has no audio either way.)
3. **`ɛɪ̆ɚ̆` vs `eɪ̆ɚ̆`** — the database uses `ɛ`, the filename uses `e`. They are
   currently treated as the same sound. Worth confirming which is intended,
   since it changes what learners are taught to type.
