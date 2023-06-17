import { useState } from 'react'
import {
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Link,
  Button,
  Image,
  Flex,
  Box,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import React from 'react'
import { Coach } from '../PrelaunchHomePage/types'
import { getIconLink, removeProtocol } from './utils'
import AboutCardModal from './AboutCardModal'
import useMidSizeCheck from '../hooks/useMidSizeCheck'

interface AboutCardProps extends Coach {}

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
  const isMidSized = useMidSizeCheck()
  const cardHeight = useBreakpointValue({
    base: '1100px', // Height for mobile screens
    md: '1400px', // Height for medium-sized screens
    lg: '650px', // Height for large-sized screens
  })

  const cardBioHeight = useBreakpointValue({
    base: '500px', // Height for mobile screens
    md: '600px', // Height for medium-sized screens
    lg: '500px', // Height for large-sized screens
  })

  const handleModal = () => {
    setIsOpen(!isOpen)
  }

  const handleIconClick = (link: string) => {
    window.open(link, '_blank')
  }

  return (
    <>
      <Card
        maxW="xl"
        h={cardHeight}
        w="100%"
        m="14"
        borderRadius="10"
        boxShadow="dark-lg"
      >
        <Flex
          h={isMidSized ? '65%' : '45%'}
          justifyContent="space-between"
          direction={isMidSized ? 'column' : 'row'}
        >
          <Image
            src={photoSrc}
            alt={name}
            objectFit="cover"
            h="100%"
            flexBasis="50%"
            borderTopLeftRadius={10}
            borderTopRightRadius={isMidSized ? 10 : 0}
          />
          <Flex
            direction="column"
            textAlign="end"
            bg="brand.purple"
            basis="50%"
            p={3}
            justifyContent="space-between"
            borderTopRightRadius={isMidSized ? 0 : 10}
          >
            <Box>
              <Heading
                size="lg"
                fontWeight="extrabold"
                mr={4}
                color="util.white"
              >
                {name}
              </Heading>
              <Text color="gray.300" fontSize="sm" mb={3} mr={4}>
                {title}
              </Text>
            </Box>
            <Flex direction="column">
              <Link
                href={website}
                isExternal
                color="gray.300"
                fontSize="sm"
                mr={4}
              >
                {removeProtocol(website)}
              </Link>
              {websiteSecondary && (
                <Link
                  href={websiteSecondary}
                  isExternal
                  color="gray.300"
                  fontSize="sm"
                  mb={3}
                  mr={4}
                >
                  {removeProtocol(websiteSecondary)}
                </Link>
              )}
              {icons && icons?.length > 0 && (
                <Flex justifyContent="flex-end">
                  {icons.map((icon, index) => {
                    const link = getIconLink(icon)
                    return (
                      <Icon
                        as={icon}
                        color="gray.300"
                        fontSize="xl"
                        mr={4}
                        key={index}
                        onClick={() => handleIconClick(link)}
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  })}
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
        <CardBody w={isMidSized ? '100%' : undefined}>
          <Text fontSize="lg" mr="6" ml="6" mt="6">
            {bio}
          </Text>
        </CardBody>
        <CardFooter
          style={{ borderTopColor: 'lightgray' }}
          borderTop="1px"
          onClick={handleModal}
        >
          <Button w="100%" variant="brandGhost">
            Learn More About {name}
          </Button>
        </CardFooter>
      </Card>
      <AboutCardModal {...{ isOpen, handleModal, longBio, name }} />
    </>
  )
}

export default AboutCard
