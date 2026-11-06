import React from 'react'
import {
  Box,
  Flex,
  Icon,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaQuoteLeft } from 'react-icons/fa'

interface PrelaunchCardProps {
  testimonial: string
  name: string
  subtitle: string
  image: string
  altText: string
}

const PrelaunchCard: React.FC<PrelaunchCardProps> = ({
  testimonial,
  name,
  subtitle,
  image,
  altText,
}) => {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.100"
      boxShadow="0 1px 2px rgba(17,24,39,0.04), 0 20px 48px -24px rgba(17,24,39,0.18)"
      overflow="hidden"
      mx="auto"
      maxW="1000px"
      textAlign="left"
    >
      <Box
        w={{ base: '100%', md: '320px' }}
        h={{ base: '280px', md: 'auto' }}
        minH={{ md: '360px' }}
        position="relative"
        bgGradient="linear(to-br, brand.purple, brand.iris)"
        flexShrink={0}
      >
        <Image
          src={image}
          alt={altText}
          objectFit="cover"
          objectPosition="top"
          w="100%"
          h="100%"
        />
      </Box>

      <Stack
        spacing={5}
        p={{ base: 6, md: 10 }}
        flex="1"
        justify="center"
      >
        <Icon as={FaQuoteLeft} boxSize={6} color="brand.purpleLight" opacity={0.6} />
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          color="gray.700"
          lineHeight="1.7"
          noOfLines={{ base: 8, md: 10 }}
        >
          {testimonial}
        </Text>
        <Stack spacing={0} pt={2}>
          <Text fontSize="md" fontWeight="bold" color="gray.900">
            {name}
          </Text>
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            {subtitle}
          </Text>
        </Stack>
      </Stack>
    </Flex>
  )
}

export default PrelaunchCard
