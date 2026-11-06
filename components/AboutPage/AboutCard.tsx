import React, { useState } from 'react'
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ArrowForwardIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Coach } from '../PrelaunchHomePage/types'
import { getIconLink, removeProtocol } from './utils'
import AboutCardModal from './AboutCardModal'

type AboutCardProps = Coach

const AboutCard: React.FC<AboutCardProps> = ({
  name,
  title,
  bio,
  longBio,
  photoSrc,
  website,
  websiteSecondary,
  icons,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleModal = () => setIsOpen((v) => !v)

  return (
    <>
      <Stack
        spacing={0}
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.100"
        boxShadow="0 1px 2px rgba(17,24,39,0.04), 0 20px 48px -24px rgba(17,24,39,0.18)"
        overflow="hidden"
        h="100%"
        transition="transform 0.2s ease, box-shadow 0.2s ease"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow:
            '0 1px 2px rgba(17,24,39,0.04), 0 28px 56px -24px rgba(114,63,197,0.25)',
        }}
      >
        {/* Portrait: 1:1 square, face centered — no overlay */}
        <Box
          position="relative"
          bgGradient="linear(to-br, #F5F2FF, #E6F6FB)"
        >
          <AspectRatio ratio={1}>
            <Image
              src={photoSrc}
              alt={name}
              objectFit="cover"
              objectPosition="center top"
            />
          </AspectRatio>
        </Box>

        {/* Name + title strip */}
        <Stack
          spacing={1}
          px={{ base: 6, md: 8 }}
          pt={{ base: 6, md: 7 }}
          pb={2}
        >
          <Heading
            as="h2"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="black"
            letterSpacing="-0.01em"
            lineHeight="1.15"
            color="gray.900"
          >
            {name}
          </Heading>
          <Text fontSize="sm" color="brand.purple" fontWeight="semibold">
            {title}
          </Text>
        </Stack>

        {/* Body */}
        <Stack spacing={5} px={{ base: 6, md: 8 }} pt={4} pb={6} flex="1">
          <Text color="gray.600" lineHeight="1.7">
            {bio}
          </Text>

          <Stack spacing={2}>
            <Link
              href={website}
              isExternal
              color="brand.purple"
              fontSize="sm"
              fontWeight="medium"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
              _hover={{ color: 'brand.purpleLight', textDecoration: 'none' }}
            >
              {removeProtocol(website)}
              <ExternalLinkIcon boxSize={3} />
            </Link>
            {websiteSecondary && (
              <Link
                href={websiteSecondary}
                isExternal
                color="brand.purple"
                fontSize="sm"
                fontWeight="medium"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                _hover={{ color: 'brand.purpleLight', textDecoration: 'none' }}
              >
                {removeProtocol(websiteSecondary)}
                <ExternalLinkIcon boxSize={3} />
              </Link>
            )}
          </Stack>

          {icons && icons.length > 0 && (
            <HStack spacing={3}>
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
                    w="38px"
                    h="38px"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    borderWidth="1px"
                    borderColor="gray.200"
                    color="gray.600"
                    transition="all 0.15s"
                    _hover={{
                      color: 'brand.purple',
                      borderColor: 'brand.purpleLight',
                      bg: 'purple.50',
                    }}
                  >
                    <Icon as={IconComponent} boxSize={4} />
                  </Flex>
                )
              })}
            </HStack>
          )}
        </Stack>

        <Box borderTopWidth="1px" borderTopColor="gray.100" p={4}>
          <Button
            onClick={handleModal}
            w="100%"
            variant="ghost"
            color="brand.purple"
            fontWeight="semibold"
            rightIcon={<ArrowForwardIcon />}
            _hover={{ bg: 'purple.50', color: 'brand.purpleLight' }}
          >
            Learn more about {name.split(' ')[0]}
          </Button>
        </Box>
      </Stack>
      <AboutCardModal {...{ isOpen, handleModal, longBio, name }} />
    </>
  )
}

export default AboutCard
