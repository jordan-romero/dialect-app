import React, { useId } from 'react'
import { Box, Button, Text, Tooltip } from '@chakra-ui/react'
import InfoTerm from './InfoTerm'

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

  // Capped and given a fixed shape: stretched to the page width the
  // quadrilateral flattened out and the vowels spread too far apart.
  // SVG gradient ids are global to the page; keep each chart's unique.
  const fillId = `vq-fill-${useId().replace(/:/g, '')}`

  return (
    <Box
      maxW="760px"
      mx="auto"
      w="100%"
      // Pinned light card (the tiles and rules are light in both modes):
      // a soft lavender-to-blue wash in the brand colours.
      bgGradient="linear(to-br, #F6F4FF, #EEF5FD)"
      border="1px solid"
      borderColor="#E6E1FA"
      borderRadius="xl"
      boxShadow="0 1px 3px rgba(95, 83, 207, 0.08)"
      px={{ base: 3, md: 5 }}
      pt={{ base: 3, md: 4 }}
      pb={{ base: 2, md: 3 }}
    >
      {/* Column headers */}
      <Box
        position="relative"
        h="30px"
        mb={1}
        ml={{ base: '68px', md: '96px' }}
      >
        {(
          [
            ['Front', FRONT.close],
            ['Central', CENTRE.close],
            ['Back', BACK],
          ] as [string, number][]
        ).map(([label, x]) => (
          <Box
            key={label}
            position="absolute"
            left={`${x}%`}
            transform="translateX(-50%)"
          >
            <InfoTerm
              definition={ADVANCEMENT_DEFS[label]}
              fontSize={{ base: 'xs', md: 'md' }}
              fontWeight="semibold"
              color="gray.700"
            >
              {label}
            </InfoTerm>
          </Box>
        ))}
      </Box>

      <Box display="flex" alignItems="stretch" gap={2}>
        {/* Row headers */}
        <Box
          position="relative"
          w={{ base: '60px', md: '88px' }}
          flexShrink={0}
        >
          {(
            [
              ['Close', ROWS.close],
              ['Close-mid', ROWS.closeMid],
              ['Open-mid', ROWS.openMid],
              ['Open', ROWS.open],
            ] as [string, number][]
          ).map(([label, y]) => (
            <Box
              key={label}
              position="absolute"
              top={`${y}%`}
              right="0"
              transform="translateY(-50%)"
              whiteSpace="nowrap"
            >
              <InfoTerm
                definition={HEIGHT_DEFS[label]}
                fontSize={{ base: 'xs', md: 'md' }}
                fontWeight="semibold"
                color="gray.700"
              >
                {label}
              </InfoTerm>
            </Box>
          ))}
        </Box>

        {/* The chart itself */}
        <Box
          position="relative"
          flex="1"
          // A fixed shape on wider screens; on phones the 3:2 box would be too
          // short for the tiles, so it gets a minimum height instead.
          sx={{ aspectRatio: { md: '3 / 2' } }}
          minH={{ base: '320px', md: 0 }}
        >
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
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5F53CF" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#7EACE2" stopOpacity="0.14" />
              </linearGradient>
            </defs>
            <polygon
              points={OUTLINE.map(([x, y]) => `${x},${y}`).join(' ')}
              fill={`url(#${fillId})`}
              stroke="#5F53CF"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {RULES.map(([y, x1, x2]) => (
              <line
                key={y}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#5F53CF"
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {DOTS.map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="1"
                fill="#5F53CF"
                fillOpacity="0.7"
              />
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
                  minW={{ base: '32px', md: '40px' }}
                  h={{ base: '32px', md: '40px' }}
                  px={1}
                  borderRadius="lg"
                  fontFamily="ipa"
                  className="ipa-text"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  variant="outline"
                  // Picked vowels show in blue, matching the slots they fill.
                  bg={used ? 'blue.50' : 'white'}
                  boxShadow="0 1px 2px rgba(95, 83, 207, 0.15)"
                  transition="transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, color 0.15s ease"
                  _hover={
                    disabled
                      ? {}
                      : {
                          borderColor: used ? 'blue.500' : 'brand.iris',
                          color: 'brand.iris',
                          boxShadow: '0 4px 10px rgba(95, 83, 207, 0.18)',
                          transform: 'translate(-50%, calc(-50% - 2px))',
                        }
                  }
                  // The quadrilateral behind these keeps its light rules in
                  // both modes, so the symbol colour is pinned rather than
                  // inherited.
                  color="gray.800"
                  borderColor={used ? 'blue.400' : '#DDD8F7'}
                  borderWidth={used ? 2 : 1}
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
