import { Card, Flex, Heading, Spacer, Text } from '@chakra-ui/react'
import React from 'react'
import useMobileCheck from '../../hooks/useMobileCheck'

const PrelaunchMain = () => {
  const isMobile = useMobileCheck()

  if (isMobile) {
    return (
      <Flex direction="column" mt={4}>
        <PrelaunchMainMobile />
      </Flex>
    );
  }
  return (
        <Flex w="575px" h="375px" flexDirection="column">
          <Heading fontSize="4xl" fontWeight='black' lineHeight='1.25'>
            Welcome to the future home of <Text color="brand.purple">ActingAccents.com!</Text>
          </Heading>
          <Text fontSize="lg" mt='7' w="85%" >
            This website will be a resource for learning various dialects and
            accents for performance purposes. Whether you have a natural gift
            for dialects, or you find the process intimidating, having a
            systematic approach will help you to make more authentic dialect and
            accent choices.
          </Text>
          <Text fontSize='lg' fontWeight='extrabold' mt='5' w='85%'>
            Ultimately, this course will teach you to teach yourself any dialect or accent you desire. 
          </Text>
         
        </Flex>
  )
}
const PrelaunchMainMobile = () => {
  return (
    <Card maxW="sm" mx="auto" mt={1} p={6} boxShadow='lg'>
      <Heading fontSize="3xl" fontWeight="black" lineHeight="1.25" display="inline">
        Welcome to the future home of
        <Text color="brand.purple">ActingAccents.com!</Text>
      </Heading>
      <Text fontSize="md" mt={7}>
        This website will be a resource for learning various dialects and accents
        for performance purposes. Whether you have a natural gift for dialects, or
        you find the process intimidating, having a systematic approach will help
        you to make more authentic dialect and accent choices.
      </Text>
      <Text fontSize="lg" fontWeight="extrabold" mt={5}>
        Ultimately, this course will teach you to teach yourself any dialect or
        accent you desire.
      </Text>
    </Card>
  );
};
export default PrelaunchMain