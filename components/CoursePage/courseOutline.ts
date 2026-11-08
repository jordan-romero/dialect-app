// The course outline shown on the public /course page.
//
// The page reads the live outline from the course database (lib/coursePreview.ts)
// and refreshes it hourly. FALLBACK_PHASES below is a snapshot of that outline,
// used only if the database can't be reached when the page is built. Only
// titles, summaries and exercise names appear here, never paid content.

export type OutlineLesson = {
  title: string
  summary: string
  exercises?: string[]
  free?: boolean
  checkpoint?: boolean
}

export type OutlinePhase = {
  name: string
  title: string
  blurb: string
  lessons: OutlineLesson[]
}

export const FALLBACK_PHASES: OutlinePhase[] = [
  {
    name: 'Phase 1',
    title: 'Learn the alphabet of sound',
    blurb:
      'Why spelling fails actors, how speech is made, and every consonant and vowel of General American, each with its IPA symbol.',
    lessons: [
      {
        title: 'What is the IPA?',
        summary:
          'What this course is about, what the IPA is and how it’s used, and what it looks like.',
        free: true,
      },
      {
        title: 'Why the IPA?',
        summary:
          'Why the IPA beats the English spelling system for learning dialects, and the difference between a dialect and an accent.',
        exercises: ['Rhyming Words'],
        free: true,
      },
      {
        title: 'The Final Pitch',
        summary: 'What to expect from the rest of the series.',
        free: true,
      },
      {
        title: 'Rethinking Speech',
        summary:
          'The physiology of speech, the difference between a vowel and a consonant, and the elements of articulation.',
        exercises: ['Speaking Without Consonants'],
      },
      {
        title: 'Consonants',
        summary:
          'How General American consonants are formed, and their IPA symbols.',
        exercises: [
          'Interactive Consonant Rectangle',
          'Match the Symbol to the Sound',
          'Consonants in Word Context',
        ],
      },
      {
        title: 'Vowels',
        summary:
          'How one-part vowels (monophthongs) are formed in General American, and their symbols.',
        exercises: [
          'Interactive Vowel Quadrilateral',
          'Match the Symbol to the Sound',
          'Vowels in Word Context',
        ],
      },
      {
        title: 'Diphthongs & Triphthongs',
        summary:
          'How two- and three-part vowels are formed, and their symbols.',
        exercises: [
          'Building the Diphthongs & Triphthongs',
          'Match the Symbol to the Sound',
          'Diphthongs & Triphthongs in Word Context',
        ],
      },
      {
        title: 'Checkpoint 1',
        summary: 'Put everything from Phase 1 to the test.',
        exercises: [
          'Corrections',
          'Build-a-Word',
          'Blank Lexical Chart',
          'Matching',
          'Reading Comprehension',
        ],
        checkpoint: true,
      },
    ],
  },
  {
    name: 'Phase 2',
    title: 'Write down what you hear',
    blurb:
      'Transcribe real speech in the IPA, from single words to full lines, mark where the stress falls, and build a lexical chart of your own.',
    lessons: [
      {
        title: 'Transcription Concepts',
        summary: 'Best practices for transcribing in the IPA.',
        exercises: [
          'Transcription Matching',
          'Regional Options',
          'Simple Transcription',
        ],
      },
      {
        title: 'Transcription In Action',
        summary:
          'Transcribing phrases and sentences as connected speech, the way people actually talk.',
        exercises: [
          'Connected Speech Matching',
          'Descriptive Transcription',
          'Film Quotes',
        ],
      },
      {
        title: 'Stress',
        summary:
          'Lexical versus operative stress, and how to mark stress in a transcription.',
        exercises: ['Syllabic Stress: Noun vs. Verb', 'Stress Suprasegmentals'],
      },
      {
        title: 'Fake Lexical Chart',
        summary:
          'Learn to use a lexical template by building a dialect of your own invention.',
      },
      {
        title: 'Checkpoint 2',
        summary:
          'Transcribe Hamlet’s advice to the players before moving on to Phase 3.',
        exercises: [
          'Hamlet’s Advice pt. 1',
          'Hamlet’s Advice pt. 2',
          'Hamlet’s Advice pt. 3',
          'Hamlet’s Advice pt. 4',
        ],
        checkpoint: true,
      },
    ],
  },
  {
    name: 'Phase 3',
    title: 'Put on a dialect: British RP',
    blurb:
      'Learn British Received Pronunciation sound by sound, from example speakers to its rhythm and melody, then carry it into a performance of Hamlet’s advice.',
    lessons: [
      {
        title: 'Gathering Resources',
        summary:
          'What makes a good example speaker, and how to sort sources into primary, secondary and tertiary.',
      },
      {
        title: 'Segmental Features of the Dialect',
        summary:
          'Every one-to-one sound change of British Received Pronunciation.',
        exercises: ['Repeat After Me: Tongue Twisters'],
      },
      {
        title: 'Distinct Features of the Dialect',
        summary:
          'The features that make RP sound like RP, including linking and intrusive R.',
        exercises: [
          'Choose the Right Transcription',
          'Distinct Features of RP',
          'Repeat After Me: Tongue Twisters',
        ],
      },
      {
        title: 'Prosody of the Dialect',
        summary: 'The music of British RP: its rhythm, pitch and melody.',
      },
      {
        title: 'Dialect Transcription in Action',
        summary:
          'The order of operations for transcribing a text from one dialect into another.',
        exercises: ['Practice RP Changes'],
      },
      {
        title: 'Transcription Transformation',
        summary: 'Transcribe Hamlet’s advice into British RP.',
        exercises: ['Transcribing Hamlet’s Advice into RP'],
      },
      {
        title: 'Performance Implementation',
        summary: 'Marry your dialect work to your performance choices.',
      },
    ],
  },
]

// Marketing copy for each phase, by position. The course records only carry
// a phase name ("Phase 1") and an internal note, so the headline and blurb
// live here. A phase beyond these falls back to its course record.
export const PHASE_COPY: { title: string; blurb: string }[] =
  FALLBACK_PHASES.map(({ title, blurb }) => ({ title, blurb }))

export type CourseStats = {
  phases: number
  lessons: number
  checkpoints: number
  exercises: number
  handouts: number
  freeLessons: number
}

export const computeStats = (
  phases: OutlinePhase[],
  handouts: number,
): CourseStats => {
  const all = phases.flatMap((p) => p.lessons)
  return {
    phases: phases.length,
    lessons: all.filter((l) => !l.checkpoint).length,
    checkpoints: all.filter((l) => l.checkpoint).length,
    exercises: all.reduce((n, l) => n + (l.exercises?.length ?? 0), 0),
    handouts,
    freeLessons: all.filter((l) => l.free).length,
  }
}

// Handout count at the time of the snapshot above.
export const FALLBACK_STATS = computeStats(FALLBACK_PHASES, 40)
