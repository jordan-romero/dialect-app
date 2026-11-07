import React, { useCallback, useEffect, useState } from 'react'
import { Box, Flex, HStack, Icon, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PrelaunchCard from './PrelaunchCard'
import { EASE } from '../motion'

interface Card {
  id: number
  testimonial: string
  name: string
  subtitle: string
  image: string
  altText: string
}

interface CardCarouselProps {
  cards: Card[]
}

const INTERVAL_MS = 7000

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.98 }),
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
  const reduce = useReducedMotion()
  const [[index, dir], setPage] = useState<[number, number]>([0, 1])
  const [paused, setPaused] = useState(false)

  const go = useCallback(
    (delta: number) =>
      setPage(([i]) => [(i + delta + cards.length) % cards.length, delta]),
    [cards.length],
  )

  // Auto-advance unless the visitor is hovering, has focus inside, or prefers
  // reduced motion.
  useEffect(() => {
    if (paused || reduce) return
    const id = setTimeout(() => go(1), INTERVAL_MS)
    return () => clearTimeout(id)
  }, [index, paused, reduce, go])

  const card = cards[index]

  return (
    <Flex align="center" justify="center" width="100%">
      <Box
        maxWidth="1100px"
        width="100%"
        position="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Testimonials"
      >
        <Box position="relative" px={{ base: 0, md: 16 }}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={card.id}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1)
                else if (info.offset.x > 70) go(-1)
              }}
              style={{ cursor: 'grab', touchAction: 'pan-y' }}
              aria-live={paused ? 'polite' : 'off'}
            >
              <PrelaunchCard {...card} />
            </motion.div>
          </AnimatePresence>

          <IconButton
            aria-label="Previous testimonial"
            icon={<Icon as={ChevronLeftIcon} boxSize={6} />}
            onClick={() => go(-1)}
            left={0}
            {...arrowStyle}
          />
          <IconButton
            aria-label="Next testimonial"
            icon={<Icon as={ChevronRightIcon} boxSize={6} />}
            onClick={() => go(1)}
            right={0}
            {...arrowStyle}
          />
        </Box>

        {/* Dots double as a progress bar for the active slide */}
        <HStack spacing={2} justify="center" mt={8}>
          {cards.map((c, i) => {
            const active = i === index
            return (
              <Box
                as="button"
                key={c.id}
                aria-label={`Show testimonial ${i + 1} of ${cards.length}`}
                aria-current={active}
                onClick={() => setPage(([cur]) => [i, i > cur ? 1 : -1])}
                position="relative"
                h="8px"
                w={active ? '40px' : '8px'}
                borderRadius="full"
                bg="blackAlpha.200"
                overflow="hidden"
                transition="width 0.3s ease"
              >
                {active && (
                  <motion.span
                    key={`${c.id}-${paused}`}
                    initial={{ scaleX: reduce || paused ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: reduce || paused ? 0 : INTERVAL_MS / 1000,
                      ease: 'linear',
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transformOrigin: '0% 50%',
                      background: 'linear-gradient(90deg, #723FC5, #5F53CF)',
                      borderRadius: 9999,
                    }}
                  />
                )}
              </Box>
            )
          })}
        </HStack>
      </Box>
    </Flex>
  )
}

const arrowStyle = {
  position: 'absolute' as const,
  top: '50%',
  transform: 'translateY(-50%)',
  display: { base: 'none', md: 'inline-flex' },
  w: '48px',
  h: '48px',
  borderRadius: 'full',
  bg: 'white',
  color: 'brand.purple',
  borderWidth: '1px',
  borderColor: 'blackAlpha.100',
  boxShadow: '0 8px 24px -8px rgba(17,24,39,0.25)',
  _hover: {
    bg: 'brand.purple',
    color: 'white',
    transform: 'translateY(-50%) scale(1.06)',
  },
  zIndex: 2,
}

export default CardCarousel
