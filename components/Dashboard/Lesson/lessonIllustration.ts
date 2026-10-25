/**
 * Per-lesson illustrations, from Grayson's "Acting Accents Illustrations" set.
 *
 * The artwork is authored per course module (the numbering on the Drive
 * folders: "5 - Consonants", "13a - Segmental Features"), which is not the same
 * as the database lesson id — so the mapping is explicit rather than derived.
 *
 * Files live in `public/illustrations/`. Anything without an entry falls back
 * to the generic illustration the app used everywhere before, so an unmapped
 * lesson degrades to the old look rather than a broken image.
 */

/** Lesson id -> file in public/illustrations (without the extension). */
const LESSON_ILLUSTRATIONS: Record<number, string> = {
  1: '01-what-is-the-ipa',
  2: '02-why-the-ipa',
  3: '03-final-pitch',
  4: '04-rethinking-speech',
  6: '05-consonants',
  8: '06-vowels',
  10: '07-diphthongs-triphthongs',
  13: '08-transcription-concepts',
  14: '09-transcription-in-action',
  15: '10-stress',
  16: '11-fake-lexical-chart',
  17: '12-gathering-resources',
  18: '13a-segmental-features',
  19: '13b-distinct-features',
  20: '13c-prosody',
  21: '14b-transcription-transformation',
  22: '15-performance-implementation',
  23: '14a-dialect-transcription-in-action',
  24: 'outro',
  // 25 (Checkpoint 1) has no artwork in the set — it falls back below.
  26: 'hamlets-advice',
}

const FALLBACK = './descriptionIllustration.svg'

/** Illustration for a lesson's description step. */
export const lessonIllustration = (lessonId: number): string => {
  const name = LESSON_ILLUSTRATIONS[lessonId]
  return name ? `/illustrations/${name}.png` : FALLBACK
}

/** Shown when a lesson is finished. */
export const COMPLETION_ILLUSTRATION = '/illustrations/lesson-complete.png'
