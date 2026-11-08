import { Box } from '@chakra-ui/react'
import React from 'react'
import PrelaunchContent from './PrelaunchContent/PrelaunchContentContainer'
import PrelaunchCardsContainer from './PrelaunchCardsContainer/PrelaunchCardsContainer'
import PrelaunchTestimonialsContainer from './PrelaunchTestimonials/PrelaunchTestimonialsContainer'
import { FloatingGlyphs, GlyphMarquee } from './motion'

const PrelaunchHomePage = () => {
  return (
    <>
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

        <Box
          position="relative"
          overflow="hidden"
          bg="#140D2A"
          borderRadius={{ base: 0, md: '3xl' }}
          mb={{ base: 0, md: 12 }}
          _before={{
            content: '""',
            position: 'absolute',
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '700px',
            bg: 'radial-gradient(closest-side, rgba(149,128,255,0.30), transparent 70%)',
            pointerEvents: 'none',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: '-25%',
            right: '-10%',
            width: '600px',
            height: '600px',
            bg: 'radial-gradient(closest-side, rgba(126,172,226,0.18), transparent 70%)',
            pointerEvents: 'none',
          }}
        >
          <Box position="relative" zIndex={1}>
            <PrelaunchTestimonialsContainer />
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default PrelaunchHomePage
