import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Coach } from '../PrelaunchHomePage/types'
import { EASE } from '../PrelaunchHomePage/motion'
import { getIconLink, removeProtocol } from './utils'
import AboutCardModal from './AboutCardModal'

type AboutCardProps = Coach & {
  index?: number
  reverse?: boolean
}

// First names in IPA, a small nod to what the coaches teach.
const NAME_IPA: Record<string, string> = {
  Scott: '/skɑt/',
  Krista: '/ˈkɹɪs.tə/',
}

const AboutCard: React.FC<AboutCardProps> = ({
  name,
  title,
  bio,
  longBio,
  photoSrc,
  website,
  websiteSecondary,
  icons,
  index = 0,
  reverse = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleModal = () => setIsOpen((v) => !v)
  const firstName = name.split(' ')[0]
  const ipa = NAME_IPA[firstName]

  // The portrait drifts a little as the row scrolls past.
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const drift = useTransform(scrollYProgress, [0, 1], [30, -30])

  const sites = [website, websiteSecondary].filter(Boolean) as string[]

  return (
    <>
      <Grid
        ref={ref}
        templateColumns={{
          base: '1fr',
          lg: reverse ? '1fr 0.85fr' : '0.85fr 1fr',
        }}
        gap={{ base: 10, lg: 20 }}
        alignItems="center"
      >
        {/* Portrait */}
        <Box
          order={{ base: 0, lg: reverse ? 1 : 0 }}
          position="relative"
          maxW={{ base: '420px', lg: 'none' }}
          mx={{ base: 'auto', lg: 0 }}
          w="100%"
        >
          <motion.div
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {/* Offset brand shape behind the photo */}
            <Box
              position="absolute"
              inset={0}
              transform={
                reverse
                  ? 'translate(-22px, 22px) rotate(-3deg)'
                  : 'translate(22px, 22px) rotate(3deg)'
              }
              borderRadius="3xl"
              bgGradient="linear(to-br, brand.purple, brand.iris 55%, brand.blue)"
              opacity={0.9}
            />
            <Box
              position="relative"
              borderRadius="3xl"
              overflow="hidden"
              boxShadow="0 30px 60px -28px rgba(30,20,70,0.5)"
              sx={{ aspectRatio: '4 / 5' }}
              bg="purple.50"
            >
              <motion.div
                style={{ y: drift, height: '112%', marginTop: '-6%' }}
              >
                <Image
                  src={photoSrc}
                  alt={name}
                  objectFit="cover"
                  objectPosition="center top"
                  w="100%"
                  h="100%"
                />
              </motion.div>
            </Box>
            {ipa && (
              <Box
                position="absolute"
                bottom={{ base: 4, md: 6 }}
                {...(reverse
                  ? { right: { base: 4, md: -6 } }
                  : { left: { base: 4, md: -6 } })}
                bg="whiteAlpha.900"
                backdropFilter="blur(10px)"
                borderRadius="xl"
                px={4}
                py={2.5}
                boxShadow="0 16px 36px -14px rgba(30,20,70,0.4)"
                aria-label={`${firstName}, in IPA`}
              >
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontWeight="semibold"
                  lineHeight="1.2"
                >
                  {firstName}
                </Text>
                <Text
                  fontFamily="ipa"
                  fontSize="xl"
                  color="brand.purple"
                  fontWeight="bold"
                  lineHeight="1.3"
                >
                  {ipa}
                </Text>
              </Box>
            )}
          </motion.div>
        </Box>

        {/* Text */}
        <Box order={{ base: 1, lg: reverse ? 0 : 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          >
            <Stack spacing={6}>
              <Stack spacing={3}>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="brand.purple"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  aria-hidden
                >
                  Coach 0{index + 1}
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: '4xl', md: '5xl' }}
                  fontWeight="black"
                  letterSpacing="-0.03em"
                  lineHeight="1.02"
                  color="gray.900"
                >
                  {name}
                </Heading>
                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  color="brand.purple"
                  fontWeight="semibold"
                >
                  {title}
                </Text>
              </Stack>

              <Box
                w="56px"
                h="3px"
                borderRadius="full"
                bgGradient="linear(to-r, brand.purple, brand.iris)"
              />

              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.600"
                lineHeight="1.8"
              >
                {bio}
              </Text>

              <Stack spacing={2.5}>
                {sites.map((site) => (
                  <Link
                    key={site}
                    href={site}
                    isExternal
                    role="group"
                    display="inline-flex"
                    alignItems="center"
                    gap={2}
                    alignSelf="flex-start"
                    fontWeight="semibold"
                    color="gray.800"
                    borderBottomWidth="1.5px"
                    borderColor="purple.100"
                    pb={0.5}
                    _hover={{
                      color: 'brand.purple',
                      borderColor: 'brand.purple',
                      textDecoration: 'none',
                    }}
                    transition="color 0.2s, border-color 0.2s"
                  >
                    {removeProtocol(site)}
                    <ArrowForwardIcon
                      transform="rotate(-45deg)"
                      transition="transform 0.2s"
                      _groupHover={{
                        transform: 'rotate(-45deg) translateX(3px)',
                      }}
                    />
                  </Link>
                ))}
              </Stack>

              <Flex align="center" gap={5} wrap="wrap" pt={2}>
                <Button
                  onClick={handleModal}
                  size="lg"
                  borderRadius="xl"
                  px={7}
                  rightIcon={<ArrowForwardIcon />}
                  bgGradient="linear(to-r, brand.purple, brand.iris)"
                  color="white"
                  fontWeight="semibold"
                  boxShadow="0 10px 24px -8px rgba(114,63,197,0.55)"
                  _hover={{
                    bgGradient: 'linear(to-r, brand.purpleLight, brand.purple)',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  Learn more about {firstName}
                </Button>

                {icons && icons.length > 0 && (
                  <HStack spacing={1}>
                    {icons.map((IconComponent) => {
                      const link = getIconLink(IconComponent)
                      return (
                        <Flex
                          key={link}
                          as="a"
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${name} social link`}
                          w="40px"
                          h="40px"
                          align="center"
                          justify="center"
                          borderRadius="full"
                          color="gray.500"
                          transition="all 0.15s"
                          _hover={{ color: 'brand.purple', bg: 'purple.50' }}
                        >
                          <Icon as={IconComponent} boxSize={5} />
                        </Flex>
                      )
                    })}
                  </HStack>
                )}
              </Flex>
            </Stack>
          </motion.div>
        </Box>
      </Grid>
      <AboutCardModal {...{ isOpen, handleModal, longBio, name }} />
    </>
  )
}

export default AboutCard
