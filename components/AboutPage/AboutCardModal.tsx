import React, { FC } from 'react'
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

interface AboutCardModalProps {
  isOpen: boolean
  handleModal: () => void
  longBio: JSX.Element
  name: string
}

const AboutCardModal: FC<AboutCardModalProps> = ({
  isOpen,
  handleModal,
  longBio,
  name,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={handleModal} size={{ base: 'full', md: '4xl' }} scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius={{ base: 0, md: '2xl' }}
        boxShadow="0 24px 60px -16px rgba(30,20,70,0.35)"
        mx={{ base: 0, md: 4 }}
      >
        <ModalHeader
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="black"
          letterSpacing="-0.01em"
          color="gray.900"
          pt={{ base: 6, md: 8 }}
          px={{ base: 6, md: 10 }}
        >
          {name}
          <Box
            mt={2}
            w="60px"
            h="3px"
            borderRadius="full"
            bgGradient="linear(to-r, brand.purple, brand.iris)"
          />
        </ModalHeader>
        <ModalCloseButton top={{ base: 4, md: 6 }} right={{ base: 4, md: 6 }} />
        <ModalBody
          px={{ base: 6, md: 10 }}
          pb={{ base: 8, md: 10 }}
          fontSize="md"
          lineHeight="1.75"
          color="gray.700"
        >
          {longBio}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AboutCardModal
