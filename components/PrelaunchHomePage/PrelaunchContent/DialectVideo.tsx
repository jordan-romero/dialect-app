import React from 'react'
import { AspectRatio, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { EASE, IpaTicker } from '../motion'

const DialectVideo = () => {
  const videoId = 'Ajyd9gDo614'

  return (
    <Box position="relative" w="100%" sx={{ perspective: '1400px' }}>
      <motion.div
        initial={{ opacity: 0, rotateY: -14, rotateX: 6, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, rotateY: 0, rotateX: 0, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
        style={{ position: 'relative', transformStyle: 'preserve-3d' }}
      >
        {/* Soft glow behind the video card */}
        <Box
          position="absolute"
          inset="-18px"
          borderRadius="3xl"
          bgGradient="linear(to-br, rgba(114,63,197,0.35), rgba(126,172,226,0.35))"
          filter="blur(28px)"
          opacity={0.55}
          zIndex={0}
          sx={{
            animation: 'aa-glow 6s ease-in-out infinite',
            '@keyframes aa-glow': {
              '0%, 100%': { opacity: 0.45, transform: 'scale(1)' },
              '50%': { opacity: 0.7, transform: 'scale(1.03)' },
            },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
        <Box
          position="relative"
          zIndex={1}
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="0 24px 60px -16px rgba(30,20,70,0.35), 0 8px 20px -8px rgba(30,20,70,0.2)"
          borderWidth="1px"
          borderColor="whiteAlpha.700"
          bg="black"
        >
          <AspectRatio ratio={16 / 9}>
            <iframe
              title="ActingAccents teaser"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </AspectRatio>
        </Box>
      </motion.div>
      <Box
        position={{ base: 'relative', md: 'absolute' }}
        mt={{ base: 4, md: 0 }}
        left={{ base: 0, md: -6 }}
        bottom={{ md: -20 }}
        display={{ base: 'flex', md: 'block' }}
        justifyContent="center"
        zIndex={2}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 1.1 }}
        >
          <IpaTicker />
        </motion.div>
      </Box>
    </Box>
  )
}

export default DialectVideo
