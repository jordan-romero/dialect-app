import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Divider,
  Flex,
  HStack,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { EmailIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { isAppShellPath } from './appShell'

type FooterLink = {
  label: string
  href: string
  isExternal?: boolean
}

const EXPLORE_LINKS: FooterLink[] = [
  { label: 'Course', href: '/course' },
  { label: 'About', href: '/about' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact', href: '/contact' },
]

const RESOURCE_LINKS: FooterLink[] = [
  { label: 'IPA Keyboard', href: '/ipa-keyboard' },
  {
    label: 'Need a dialect coach now?',
    href: 'https://www.actorsdialectcoach.com/',
    isExternal: true,
  },
]

const Footer = () => {
  const router = useRouter()

  if (isAppShellPath(router.pathname)) return null

  const year = new Date().getFullYear()

  return (
    <Box
      as="footer"
      mt={{ base: 16, md: 24 }}
      mx={{ base: -4, md: -6, lg: -8 }}
      bg="gray.900"
      color="gray.300"
    >
      <Container
        maxW="1600px"
        px={{ base: 6, md: 10 }}
        py={{ base: 12, md: 16 }}
      >
        <SimpleGrid
          columns={{ base: 1, md: 4 }}
          spacing={{ base: 10, md: 12 }}
          mb={{ base: 10, md: 14 }}
        >
          <Stack spacing={4} gridColumn={{ md: 'span 2' }} maxW="420px">
            <NextLink href="/" passHref legacyBehavior>
              <Link
                display="inline-flex"
                alignItems="baseline"
                _hover={{ textDecoration: 'none' }}
                aria-label="ActingAccents home"
              >
                <Text
                  fontSize="2xl"
                  fontWeight="black"
                  letterSpacing="-0.02em"
                  color="white"
                  lineHeight="1"
                >
                  Acting
                  <Box
                    as="span"
                    bgGradient="linear(to-r, #B78CFF, #8A2DBB)"
                    bgClip="text"
                  >
                    Accents
                  </Box>
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  color="gray.500"
                  lineHeight="1"
                  ml={0.5}
                >
                  .com
                </Text>
              </Link>
            </NextLink>
            <Text fontSize="sm" color="gray.400" lineHeight="1.7">
              Teaching actors and performers the International Phonetic Alphabet
              — the systematic method behind authentic dialect work.
            </Text>
            <HStack
              as="a"
              href="mailto:info@actingaccents.com"
              spacing={2}
              color="gray.300"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ color: 'white' }}
              w="fit-content"
            >
              <EmailIcon />
              <Text>info@actingaccents.com</Text>
            </HStack>
          </Stack>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Resources" links={RESOURCE_LINKS} />
        </SimpleGrid>

        <Divider borderColor="whiteAlpha.200" />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={3}
          pt={6}
        >
          <Text fontSize="sm" color="gray.500">
            &copy; {year} ActingAccents.com. All rights reserved.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Built for actors, by actors.
          </Text>
        </Flex>
      </Container>
    </Box>
  )
}

type FooterColumnProps = {
  title: string
  links: FooterLink[]
}

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <Stack spacing={4}>
    <Text
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.14em"
      textTransform="uppercase"
      color="gray.500"
    >
      {title}
    </Text>
    <Stack spacing={2.5} align="flex-start">
      {links.map((link) =>
        link.isExternal ? (
          <Link
            key={link.href}
            href={link.href}
            isExternal
            fontSize="sm"
            color="gray.300"
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            _hover={{ color: 'white', textDecoration: 'none' }}
          >
            {link.label}
            <ExternalLinkIcon boxSize={3} />
          </Link>
        ) : (
          <NextLink key={link.href} href={link.href} passHref legacyBehavior>
            <Link
              fontSize="sm"
              color="gray.300"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          </NextLink>
        ),
      )}
    </Stack>
  </Stack>
)

export default Footer
