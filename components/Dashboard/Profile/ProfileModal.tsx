import React, { useEffect, useRef, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Avatar,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Button,
  Text,
  HStack,
  Icon,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FiSun, FiMoon, FiPlus, FiUploadCloud } from 'react-icons/fi'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED = [
  'General American',
  'British RP',
  'Cockney',
  'Estuary',
  'Standard British',
  'Irish',
  'Scottish',
  'Welsh',
  'Australian',
  'New York',
  'Southern US',
  'Boston',
  'Indian English',
  'French',
  'German',
  'Italian',
  'Russian',
  'Spanish',
]

// Center-crop + downscale an image file to a small square data URL so it can be
// stored directly (no upload server / presigning needed) and used as the avatar.
const fileToAvatarDataUrl = (file: File, size = 256): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const min = Math.min(img.width, img.height)
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas context'))
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })

const ProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [authPicture, setAuthPicture] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [customInterest, setCustomInterest] = useState('')
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const bg = useColorModeValue('white', 'gray.800')
  const subtle = useColorModeValue('gray.500', 'gray.400')
  const chipBg = useColorModeValue('gray.100', 'whiteAlpha.200')
  const dropBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const dropActiveBg = useColorModeValue('purple.50', 'whiteAlpha.300')
  const dropBorder = useColorModeValue('gray.300', 'whiteAlpha.400')

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setFirstName(d.firstName || '')
        setLastName(d.lastName || '')
        setAvatar(d.avatar || '')
        setAuthPicture(d.authPicture || '')
        setBio(d.bio || '')
        setInterests(Array.isArray(d.interests) ? d.interests : [])
      })
      .catch((e) => console.error('Error loading profile:', e))
  }, [isOpen])

  const handleFile = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file', status: 'warning' })
      return
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      setAvatar(dataUrl)
    } catch (e) {
      console.error('Error reading image:', e)
      toast({ title: 'Could not read that image', status: 'error' })
    }
  }

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    )
  }

  const addCustom = () => {
    const v = customInterest.trim()
    if (v && !interests.includes(v)) setInterests((prev) => [...prev, v])
    setCustomInterest('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, avatar, bio, interests }),
      })
      if (res.ok) {
        // Let the rail + welcome header refresh their avatar immediately.
        window.dispatchEvent(new Event('profile:updated'))
        toast({ title: 'Profile saved', status: 'success', duration: 2000 })
        onClose()
      } else {
        toast({ title: 'Could not save profile', status: 'error' })
      }
    } catch (e) {
      console.error('Error saving profile:', e)
      toast({ title: 'Could not save profile', status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const fullName = `${firstName} ${lastName}`.trim()
  const customChips = interests.filter((i) => !SUGGESTED.includes(i))
  const previewSrc = avatar || authPicture || undefined

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bg} borderRadius="2xl">
        <ModalHeader>Your profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Avatar + drag-and-drop upload */}
          <Flex align="center" gap={5} mb={6}>
            <Avatar
              size="xl"
              name={fullName || undefined}
              src={previewSrc}
              bg="brand.iris"
              color="white"
            />
            <Box
              flex="1"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files?.[0])
              }}
              border="2px dashed"
              borderColor={dragOver ? 'brand.iris' : dropBorder}
              bg={dragOver ? dropActiveBg : dropBg}
              borderRadius="xl"
              px={4}
              py={4}
              cursor="pointer"
              transition="all 0.15s ease"
            >
              <HStack spacing={3} color={subtle}>
                <Icon as={FiUploadCloud} boxSize={6} />
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="inherit">
                    Drag a photo here, or click to upload
                  </Text>
                  <Text fontSize="xs">PNG or JPG — square looks best</Text>
                </Box>
              </HStack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </Box>
            {avatar && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setAvatar('')}
                color={subtle}
              >
                Remove
              </Button>
            )}
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel fontSize="sm">First name</FormLabel>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jordan"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Last name</FormLabel>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Romero"
              />
            </FormControl>
          </SimpleGrid>

          <FormControl mb={5}>
            <FormLabel fontSize="sm">About you</FormLabel>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A fun blurb about yourself…"
              rows={3}
            />
          </FormControl>

          <FormControl mb={5}>
            <FormLabel fontSize="sm">
              Accents &amp; dialects you&apos;re interested in
            </FormLabel>
            <Wrap spacing={2} mb={3}>
              {SUGGESTED.map((opt) => {
                const selected = interests.includes(opt)
                return (
                  <WrapItem key={opt}>
                    <Tag
                      as="button"
                      size="md"
                      borderRadius="full"
                      variant={selected ? 'solid' : 'subtle'}
                      colorScheme={selected ? 'purple' : 'gray'}
                      bg={selected ? undefined : chipBg}
                      onClick={() => toggleInterest(opt)}
                      cursor="pointer"
                    >
                      <TagLabel>{opt}</TagLabel>
                    </Tag>
                  </WrapItem>
                )
              })}
              {customChips.map((opt) => (
                <WrapItem key={opt}>
                  <Tag
                    as="button"
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="purple"
                    onClick={() => toggleInterest(opt)}
                    cursor="pointer"
                  >
                    <TagLabel>{opt}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
            <HStack>
              <Input
                size="sm"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustom()
                  }
                }}
                placeholder="Add your own…"
                borderRadius="md"
              />
              <Button
                size="sm"
                leftIcon={<FiPlus />}
                onClick={addCustom}
                variant="brandWhite"
              >
                Add
              </Button>
            </HStack>
          </FormControl>

          {/* Appearance */}
          <Flex
            align="center"
            justify="space-between"
            p={3}
            borderRadius="lg"
            bg={chipBg}
          >
            <HStack>
              <Icon as={colorMode === 'dark' ? FiMoon : FiSun} />
              <Text fontSize="sm" fontWeight="medium">
                {colorMode === 'dark' ? 'Dark mode' : 'Light mode'}
              </Text>
            </HStack>
            <Button size="sm" variant="brandWhite" onClick={toggleColorMode}>
              Switch to {colorMode === 'dark' ? 'light' : 'dark'}
            </Button>
          </Flex>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brandBold" onClick={save} isLoading={saving}>
            Save changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProfileModal
