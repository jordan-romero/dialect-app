import {
  Box,
  Flex,
  Text,
  Link,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { EmailIcon } from '@chakra-ui/icons'
import React from 'react'

const Footer = () => {
  const handleEmailClick = () => {
    window.open('mailto:jordan@romerodev.co')
  }

  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Box h="fit-content" w="100%" bg="gray.100">
      <Flex
        direction={isMobile ? 'column' : 'row'}
        align={isMobile ? 'flex-start' : 'flex-end'}
        justify="space-between"
        p={4}
        color="gray.500"
      >
        <VStack
          align={isMobile ? 'flex-start' : 'flex-end'}
          spacing={2}
          flex={1}
        >
          <Link href="/about">About</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/contact">Contact</Link>
          <Link href="https://www.actorsdialectcoach.com/" isExternal>
            Need immediate dialect coaching? Reach out now!
          </Link>
          <Link href="mailto:info@actingaccents.com">Questions? Reach us by email</Link>
        </VStack>
        <Box
          display={isMobile ? 'flex' : 'none'}
          order={-1}
          onClick={handleEmailClick}
          cursor="pointer"
          mt={2}
        >
          Email Us
        </Box>
      </Flex>
      <Text
        textAlign={isMobile ? 'center' : 'end'}
        py={2}
        px={4}
        color="gray.500"
      >
        &copy; {new Date().getFullYear()} ActingAccents.com. All rights
        reserved.
      </Text>
    </Box>
  )
}

export default Footer
