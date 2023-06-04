import React, { useState } from 'react'
import {
  Flex,
  Center,
  Image,
  Text,
  useBreakpointValue,
  Circle,
  Button,
} from '@chakra-ui/react'
import useMobileCheck from '../../hooks/useMobileCheck'

interface PrelaunchCardProps {
  testimonial: string
  name: string
  subtitle: string
  image: string
}

const PrelaunchCard: React.FC<PrelaunchCardProps> = ({
  testimonial,
  name,
  subtitle,
  image,
}) => {
  const isMobile = useMobileCheck()
  const cardHeight = useBreakpointValue({
    base: 'auto',
    md: '600px',
    lg: '400px',
  })

  if (isMobile) {
    return (
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        w="90%"
        mt={10}
        mx="auto"
        borderRadius="lg"
        boxShadow="lg"
        backgroundColor="white"
        mb={5}
        p={4}
      >
        <Center bg="gray.200" borderRadius="full" w={40} h={40} mb={4}>
          <Image
            src={image}
            alt={`${name}'s headshot`}
            fit="cover"
            align={isMobile ? 'center' : 'top'}
            borderRadius="full"
            boxSize="full"
          />
        </Center>
        <Text fontSize="xl" mb={2} h={cardHeight} overflow="hidden">
          {testimonial}
        </Text>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          {name}
        </Text>
        <Text fontSize="md" fontStyle="italic">
          {subtitle}
        </Text>
      </Flex>
    )
  }
  return (
    <Flex
      h={cardHeight}
      w="90%"
      mt={10}
      ml="auto"
      mr="auto"
      borderRadius="lg"
      boxShadow="lg"
      backgroundColor="white"
      mb={5}
    >
      <Center w="30%" h="100%">
        <Image
          src={image}
          alt={`${name}'s headshot`}
          fit="cover"
          align="top"
          borderTopLeftRadius={4}
          borderRadius="md"
          h="100%"
        />
      </Center>
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        textAlign="start"
        w="70%"
        p={4}
      >
        <Text fontSize="xl" mb={2}>
          {testimonial}
        </Text>
        <Text fontSize="lg" fontWeight="bold" mb={2} justifySelf="flex-end">
          {name}
        </Text>
        <Text fontSize="md" fontStyle="italic">
          {subtitle}
        </Text>
      </Flex>
    </Flex>
  )
}

export default PrelaunchCard
