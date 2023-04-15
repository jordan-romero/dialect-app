import { VStack, Text, HStack, Flex, Spacer, Heading } from '@chakra-ui/react'
import React from 'react'
import { ArrowRightIcon, MoonIcon, RepeatIcon } from '@chakra-ui/icons'



const PrelaunchFooter = () => {
  return (
    <Flex h="100%" align="start">
      <VStack w="100%" h="175px" p={6} pl={0}>
        <VStack w="100%">
          <ArrowRightIcon boxSize={6} color="green.400" />
          <Heading as="b" fontSize="2xl">
            Why learn the IPA?
          </Heading>
        </VStack>
        <Text>
          IPA is a phonetic notation system that uses a set of symbols to
          represent each distinct sound that exists in human spoken language.
        </Text>
      </VStack>
      <Spacer />
      <VStack w="100%" h="175px" p={6} pl={0}>
        <VStack w="100%">
          <MoonIcon boxSize={6} color="green.400" />
          <Heading as="b" fontSize="2xl">
            Who are Scott and Krista?
          </Heading>
        </VStack>
        <Text>
          IPA badasses who basically can do everything and anything and they are
          amazing. You should totally buy their class because they know all
          things dialect.
        </Text>
      </VStack>
      <Spacer />
      <VStack w="100%" h="175px" p={6} pl={0}>
        <VStack w="100%">
          <RepeatIcon boxSize={6} color="green.400" />
          <Heading as="b" fontSize="2xl">
            Practice Makes Perfect
          </Heading>
        </VStack>
        <Text>
          I have no idea what little blurb to use here but something something
          something something etc etc etc etc etc etc etc and you know that is
          it
        </Text>
      </VStack>
      <Spacer />
    </Flex>
  )
}

export default PrelaunchFooter
