import React from 'react'
import { Flex, Center, Image, Text } from '@chakra-ui/react'

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
  return (
    <Flex
      h="400px"
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
