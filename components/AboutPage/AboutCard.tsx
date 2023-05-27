import { useState } from 'react'
import {
  Card,
  CardBody,
  Heading,
  Text,
  Link,
  Button,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Box,
} from '@chakra-ui/react'
// Will need to add social icons section
// import { SiTiktok } from 'react-icons/fa'
import React from 'react'
import { Coach } from '../types'
import { removeProtocol } from './utils'
import { FaIcons } from 'react-icons/fa'

interface AboutCardProps extends Coach {}

const AboutCard: React.FC<AboutCardProps> = ({
  name,
  title,
  bio,
  longBio,
  photoSrc,
  website,
  websiteSecondary,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleModal = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Card
        maxW="xl"
        h="600px"
        w="100%"
        m="14"
        borderRadius="10"
        boxShadow="dark-lg"
      >
        <Flex h="45%" justifyContent="space-between">
          <Image
            src={photoSrc}
            alt={name}
            objectFit="cover"
            h="100%"
            flexBasis="50%"
          />
          <Flex
            direction="column"
            textAlign="end"
            bg="brand.purple"
            basis="50%"
            p={3}
            justifyContent="space-between"
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
            </Flex>
          </Flex>
        </Flex>
        <CardBody>
          <Text mb={4}>{bio}</Text>
          <Button colorScheme="blue" onClick={handleModal}>
            Learn more about {name}
          </Button>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={handleModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{longBio}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AboutCard
