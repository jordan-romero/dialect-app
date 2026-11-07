import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContentContainer'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'
import PrelaunchTestimonialsContainer from './PrelaunchTestimonials/PrelaunchTestimonialsContainer'
import { MotionConfig } from 'framer-motion'
import { FloatingGlyphs, GlyphMarquee, ScrollProgress } from './motion'

const PrelaunchHomePage = () => {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Box bg="white">
        <Box
          position="relative"
          overflow="hidden"
          bgGradient="linear(to-br, #F5F2FF 0%, #ECEBFF 45%, #E6F6FB 100%)"
          _before={{
            content: '""',
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: { base: '500px', md: '700px' },
            height: { base: '500px', md: '700px' },
            bg: 'radial-gradient(closest-side, rgba(114,63,197,0.22), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: { base: '400px', md: '600px' },
            height: { base: '400px', md: '600px' },
            bg: 'radial-gradient(closest-side, rgba(126,172,226,0.28), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        >
          <FloatingGlyphs />
          <PrelaunchContent />
        </Box>

        <GlyphMarquee />

        <Box bg="white">
          <PrelaunchCardsContainer />
        </Box>

        <Box bgGradient="linear(to-b, #FAFAFF, white)">
          <PrelaunchTestimonialsContainer />
        </Box>
      </Box>
    </MotionConfig>
  )
}

export default PrelaunchHomePage
