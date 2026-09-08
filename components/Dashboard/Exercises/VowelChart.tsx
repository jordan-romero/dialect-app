import React from 'react'
import { Box, Button, Text, Tooltip } from '@chakra-ui/react'

/**
 * The IPA vowel quadrilateral, drawn rather than shipped as an image.
 *
 * The shape carries the information: horizontal position is tongue
 * advancement, vertical is tongue height, and the slanted front edge shows
 * front vowels retracting as the jaw opens. So it's drawn as SVG with the
 * symbols as real buttons on top — which also means each one can play its
 * sound, be clicked to build an answer, and carry a tooltip. A background
 * image would give us none of that, and would need two files kept in sync for
 * the rhotic/non-rhotic variants that differ by exactly two symbols.
 *
 * Coordinates are percentages of the drawing area, so the whole thing scales.
 */

type Vowel = { symbol: string; x: number; y: number }

/** Row (tongue height) and column (advancement) positions of the trapezoid.
 *  The front edge moves right as it descends; the back edge is vertical. */
const ROWS = { close: 13, closeMid: 37, openMid: 61, open: 85 }
const FRONT = { close: 18, closeMid: 27, openMid: 36, open: 45 }
const CENTRE = { close: 52, closeMid: 56.5, openMid: 61, open: 65.5 }
const BACK = 86

/** The corner dots of the quadrilateral, in draw order. */
const OUTLINE = [
  [FRONT.close, ROWS.close],
  [BACK, ROWS.close],
  [BACK, ROWS.open],
  [FRONT.open, ROWS.open],
]

/** Horizontal rules and their end points, matching the printed chart. */
const RULES: [number, number, number][] = [
  [ROWS.closeMid, FRONT.closeMid, BACK],
  [ROWS.openMid, FRONT.openMid, BACK],
]

/** Dots sit where a row meets a column. */
const DOTS: [number, number][] = [
  [FRONT.close, ROWS.close],
  [CENTRE.close, ROWS.close],
  [BACK, ROWS.close],
  [FRONT.closeMid, ROWS.closeMid],
  [CENTRE.closeMid, ROWS.closeMid],
  [BACK, ROWS.closeMid],
  [FRONT.openMid, ROWS.openMid],
  [CENTRE.openMid, ROWS.openMid],
  [BACK, ROWS.openMid],
  [FRONT.open, ROWS.open],
  [BACK, ROWS.open],
]

/** Symbols shared by both charts. Paired symbols sit either side of their dot:
 *  the right-hand one of a pair is the rounded vowel. */
const SHARED: Vowel[] = [
  { symbol: 'i', x: FRONT.close - 7, y: ROWS.close },
  { symbol: 'u', x: BACK + 7, y: ROWS.close },
  // ɪ and ʊ sit off the grid, between close and close-mid, as on the chart.
  { symbol: 'ɪ', x: 30, y: 23 },
  { symbol: 'ʊ', x: 74, y: 23 },
  { symbol: 'e', x: FRONT.closeMid - 7, y: ROWS.closeMid },
  { symbol: 'o', x: BACK + 7, y: ROWS.closeMid },
  { symbol: 'ɛ', x: FRONT.openMid - 7, y: ROWS.openMid },
  { symbol: 'ʌ', x: BACK - 8, y: ROWS.openMid },
  { symbol: 'ɔ', x: BACK + 7, y: ROWS.openMid },
  { symbol: 'æ', x: 41, y: 73 },
  { symbol: 'a', x: FRONT.open - 7, y: ROWS.open },
  { symbol: 'ɑ', x: BACK - 8, y: ROWS.open },
]

/** The central pair is the only difference between the two charts: on the
 *  rhotic chart they carry the r-colouring hook. */
const CENTRAL_PLAIN: Vowel[] = [
  { symbol: 'ə', x: CENTRE.closeMid + 2, y: 47 },
  { symbol: 'ɜ', x: CENTRE.openMid - 1, y: ROWS.openMid },
]
const CENTRAL_RHOTIC: Vowel[] = [
  { symbol: 'ɚ', x: CENTRE.closeMid + 2, y: 47 },
  { symbol: 'ɝ', x: CENTRE.openMid - 1, y: ROWS.openMid },
]

export const vowelsFor = (rhotic: boolean): string[] =>
  [...SHARED, ...(rhotic ? CENTRAL_RHOTIC : CENTRAL_PLAIN)].map((v) => v.symbol)

/** Header definitions, from the 7B design doc. */
const HEIGHT_DEFS: Record<string, string> = {
  Close:
    'Vowels where the tongue is arched toward the roof of the mouth, creating a smaller opening for airflow.',
  'Close-mid': 'The tongue position is between the extremes of high and low.',
  'Open-mid': 'The tongue position is between the extremes of high and low.',
  Open: 'The tongue is low in the mouth, with the jaw lowered, creating the largest opening for airflow.',
}
const ADVANCEMENT_DEFS: Record<string, string> = {
  Front: 'The highest part of the tongue is pushed forward in the mouth.',
  Central:
    'The tongue stays in the relative centre of the mouth without advancing or retracting.',
  Back: 'The tongue is positioned toward the back of the mouth.',
}

interface VowelChartProps {
  /** Swaps the central pair to their r-coloured forms. */
  rhotic?: boolean
  /** Clicking a symbol — used to build an answer. */
  onSymbolClick?: (symbol: string) => void
  /** Plays a symbol's sound, where a recording exists. */
  audioFor?: (symbol: string) => string | undefined
  /** Symbols to show as already used. */
  usedSymbols?: string[]
  disabled?: boolean
}

const VowelChart: React.FC<VowelChartProps> = ({
  rhotic = false,
  onSymbolClick,
  audioFor,
  usedSymbols = [],
  disabled = false,
}) => {
  const vowels = [...SHARED, ...(rhotic ? CENTRAL_RHOTIC : CENTRAL_PLAIN)]

  const play = (symbol: string) => {
    const url = audioFor?.(symbol)
    if (url) new Audio(url).play().catch(() => {})
  }

  return (
    <Box>
      {/* Column headers */}
      <Box position="relative" h="22px" mb={1}>
        {(
          [
            ['Front', FRONT.close],
            ['Central', CENTRE.close],
            ['Back', BACK],
          ] as [string, number][]
        ).map(([label, x]) => (
          <Tooltip key={label} label={ADVANCEMENT_DEFS[label]} hasArrow>
            <Text
              position="absolute"
              left={`${x}%`}
              transform="translateX(-50%)"
              fontSize="xs"
              fontWeight="semibold"
              color="gray.600"
              cursor="help"
              textDecoration="underline dotted"
            >
              {label}
            </Text>
          </Tooltip>
        ))}
      </Box>

      <Box display="flex" alignItems="stretch" gap={2}>
        {/* Row headers */}
        <Box position="relative" w="72px" flexShrink={0} minH="340px">
          {(
            [
              ['Close', ROWS.close],
              ['Close-mid', ROWS.closeMid],
              ['Open-mid', ROWS.openMid],
              ['Open', ROWS.open],
            ] as [string, number][]
          ).map(([label, y]) => (
            <Tooltip key={label} label={HEIGHT_DEFS[label]} hasArrow>
              <Text
                position="absolute"
                top={`${y}%`}
                right="0"
                transform="translateY(-50%)"
                fontSize="xs"
                fontWeight="semibold"
                color="gray.600"
                whiteSpace="nowrap"
                cursor="help"
                textDecoration="underline dotted"
              >
                {label}
              </Text>
            </Tooltip>
          ))}
        </Box>

        {/* The chart itself */}
        <Box position="relative" flex="1" minH="340px">
          <Box
            as="svg"
            // Chakra's Box-as-svg types omit SVG-only attributes, so this
            // small prop bag is cast through to reach the underlying element.
            {...({
              viewBox: '0 0 100 100',
              preserveAspectRatio: 'none',
            } as any)}
            position="absolute"
            inset="0"
            w="100%"
            h="100%"
            pointerEvents="none"
          >
            <polygon
              points={OUTLINE.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke="#A0AEC0"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {RULES.map(([y, x1, x2]) => (
              <line
                key={y}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#A0AEC0"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {DOTS.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#A0AEC0" />
            ))}
          </Box>

          {vowels.map((v) => {
            const used = usedSymbols.includes(v.symbol)
            const hasAudio = !!audioFor?.(v.symbol)
            return (
              <Tooltip
                key={v.symbol}
                label={hasAudio ? 'Click to place · double-click to hear' : ''}
                isDisabled={!hasAudio}
                openDelay={400}
                hasArrow
              >
                <Button
                  position="absolute"
                  left={`${v.x}%`}
                  top={`${v.y}%`}
                  transform="translate(-50%, -50%)"
                  size="sm"
                  minW="38px"
                  h="38px"
                  px={1}
                  fontFamily="ipa"
                  className="ipa-text"
                  fontSize="xl"
                  variant="outline"
                  bg="white"
                  borderColor={used ? 'purple.300' : 'gray.200'}
                  opacity={used ? 0.45 : 1}
                  isDisabled={disabled}
                  onClick={() => onSymbolClick?.(v.symbol)}
                  onDoubleClick={() => play(v.symbol)}
                  aria-label={v.symbol}
                >
                  {v.symbol}
                </Button>
              </Tooltip>
            )
          })}
        </Box>
      </Box>

      <Text fontSize="xs" color="gray.500" mt={2} textAlign="right">
        Where symbols appear in pairs, the one to the right is rounded.
      </Text>
    </Box>
  )
}

export default VowelChart
