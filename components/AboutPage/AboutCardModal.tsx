import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import React, { FC } from 'react'

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
    <Modal isOpen={isOpen} onClose={handleModal} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="8">{longBio}</ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AboutCardModal
