import React from 'react'
import { Box, HStack } from '@chakra-ui/react'

/** A light browser-window chrome around a product screenshot. */
const BrowserFrame = ({
  children,
  url = 'actingaccents.com/dashboard',
}: {
  children: React.ReactNode
  url?: string
}) => (
  <Box
    borderRadius="2xl"
    overflow="hidden"
    bg="white"
    borderWidth="1px"
    borderColor="blackAlpha.100"
    boxShadow="0 2px 4px rgba(17,24,39,0.04), 0 40px 80px -36px rgba(30,20,70,0.45)"
  >
    <HStack
      spacing={3}
      px={4}
      h={{ base: '30px', md: '38px' }}
      bg="#F4F2FA"
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      aria-hidden
    >
      <HStack spacing={1.5}>
        {['#F87171', '#FBBF24', '#34D399'].map((c) => (
          <Box key={c} w="9px" h="9px" borderRadius="full" bg={c} />
        ))}
      </HStack>
      <Box
        flex={1}
        maxW="340px"
        mx="auto"
        h={{ base: '18px', md: '22px' }}
        borderRadius="md"
        bg="white"
        fontSize={{ base: '9px', md: '11px' }}
        color="gray.500"
        display="flex"
        alignItems="center"
        justifyContent="center"
        whiteSpace="nowrap"
        overflow="hidden"
      >
        {url}
      </Box>
      <Box w="45px" display={{ base: 'none', sm: 'block' }} />
    </HStack>
    <Box position="relative" sx={{ aspectRatio: '1512 / 794' }} bg="#F7F8FC">
      {children}
    </Box>
  </Box>
)

export default BrowserFrame
