import React from 'react'
import { Box, Flex, Image, Text } from '@chakra-ui/react'
import { FiLock } from 'react-icons/fi'
import UnlockCourseButton from '../../UnlockCourseButton'

type LockedLessonPaywallProps = {
  lockReason?: string
}

const LockedLessonPaywall: React.FC<LockedLessonPaywallProps> = ({
  lockReason,
}) => {
  const isPhaseLocked = lockReason === 'phase'

  if (isPhaseLocked) {
    return (
      <Box w="100%" minH="100%" py={{ base: 10, md: 16 }} pr={{ md: 10 }}>
        <Flex direction="column" align="center" textAlign="center" gap={4}>
          <Flex
            align="center"
            justify="center"
            w={14}
            h={14}
            borderRadius="full"
            bg="purple.100"
            color="brand.iris"
            fontSize="2xl"
          >
            <FiLock />
          </Flex>
          <Text fontSize="2xl" fontWeight="bold">
            This phase is locked
          </Text>
          <Text maxW="480px" color="gray.600">
            Finish every lesson in the previous phase to open this one. You’re
            closer than you think.
          </Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box w="100%" minH="100%" py={{ base: 6, md: 10 }} pr={{ md: 10 }}>
      <Box
        maxW="1040px"
        mx="auto"
        borderRadius="xl"
        overflow="hidden"
        bgGradient="linear(135deg, #594CC3 0%, #6C73D4 52%, #89B9E4 100%)"
        boxShadow="0 18px 42px rgba(58, 47, 139, 0.26)"
      >
        <Box px={{ base: 6, sm: 9, md: 12 }} py={{ base: 9, md: 12 }}>
          <Box maxW="650px" textAlign={{ base: 'center', md: 'left' }}>
            <Flex
              align="center"
              gap={3}
              mb={4}
              justify={{ base: 'center', md: 'flex-start' }}
            >
              <Image
                src="/actingAccentsMarkTrimmed.png"
                alt="Acting Accents"
                h={{ base: '36px', md: '44px' }}
                w="auto"
                maxW="none"
                flexShrink={0}
                objectFit="contain"
              />
              <Text
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="bold"
                color="white"
                lineHeight="1.05"
                letterSpacing="-0.02em"
                textAlign="left"
              >
                Unlock the power of the IPA
              </Text>
            </Flex>
            <Text maxW="590px" color="whiteAlpha.900" fontSize="lg">
              The remaining modules are part of{' '}
              <b>The Actor’s Guide to IPA and Accents</b>.
            </Text>
            <Text mt={2} color="whiteAlpha.800" fontSize="sm">
              Make a one-time payment for lifetime access. You’ll be taken to a
              secure payment page to complete your purchase.
            </Text>

            <Flex
              mt={6}
              wrap="wrap"
              justify={{ base: 'center', md: 'flex-start' }}
              gap={{ base: 3, md: 5 }}
              pt={5}
              borderTop="1px solid"
              borderColor="whiteAlpha.400"
              color="whiteAlpha.900"
              fontSize="sm"
            >
              {[
                'Lifetime access',
                'All lessons & exercises in The Actor’s Guide to IPA and Accents',
                'Learn at your pace',
              ].map((benefit) => (
                <Flex key={benefit} align="center" gap={2}>
                  <Text color="cyan.100" fontSize="sm" lineHeight="1">
                    ✦
                  </Text>
                  {benefit}
                </Flex>
              ))}
            </Flex>

            <Box mt={6}>
              <UnlockCourseButton
                size="lg"
                appearance="light"
                label="Continue to payment"
                showLock
              />
            </Box>
            <Text mt={3} color="whiteAlpha.700" fontSize="sm">
              You’ll leave ActingAccents.com briefly to complete your one-time
              secure payment. No subscription.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LockedLessonPaywall
