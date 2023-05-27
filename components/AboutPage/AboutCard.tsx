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
} from '@chakra-ui/react'
import React from 'react'
import { Coach } from '../types'

interface AboutCardProps extends Coach {}

const AboutCard: React.FC<AboutCardProps> = ({
  name,
  title,
  bio,
  longBio,
  photoSrc,
  website,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleModal = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Card maxW="lg" h="600px" m="14" borderRadius="10" boxShadow="dark-lg">
        <Image
          borderRadius="10px 10px 0 0"
          src={photoSrc}
          alt={name}
          objectFit="cover"
          h="300px"
        />
        <CardBody>
          <Heading as="h3" size="md" mb={2}>
            {name}
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={2}>
            {title}
          </Text>
          <Text mb={4}>{bio}</Text>
          <Button colorScheme="blue" onClick={handleModal}>
            Learn more about {name}
          </Button>
          <Link href={website} isExternal>
            <Button colorScheme="blue" ml={2}>
              Visit Website
            </Button>
          </Link>
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
