import { ArrowRightIcon, HamburgerIcon } from '@chakra-ui/icons'
import { Flex, Heading, HStack, IconButton, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, Menu, MenuItem, MenuList, MenuButton, useDisclosure, Box, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack, DrawerBody } from '@chakra-ui/react'
import React, { useState } from 'react'
import NavComponent from './NavComponent'
import useMobileCheck from '../hooks/useMobileCheck'

const Navbar = () => {
  const isMobile = useMobileCheck();

  if (isMobile) {
    return (
      <MobileNavbar />
    );
  }

  return (
    <Flex w="100%" h="14" align="center">
      <HStack w="100%" spacing={0} justify="space-between">
        <HStack align="center">
          <ArrowRightIcon boxSize={8} color="brand.purple" />
          <Heading fontSize="xl" ml={2}>
            Acting Accents
          </Heading>
        </HStack>
          <HStack spacing="24px" mr={4} pr={8} justifyContent="end">
            <NavComponent navText="Home" />
            <NavComponent navText="About" />
            <NavComponent navText="Testimonials" />
            <NavComponent navText="Contact" />
          </HStack>
      </HStack>
    </Flex>
  );
};

const MobileNavbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [menuItems, setMenuItems] = useState(['Home', 'About', 'Testimonials', 'Contact']);

  return (
    <Box>
      <IconButton
        aria-label="Toggle menu"
        icon={<HamburgerIcon />}
        variant="ghost"
        onClick={onOpen}
      />

      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack p="4" spacing="4">
            {menuItems.map((item, index) => (
              <Box key={index} onClick={onClose} as="a" href={`/${item}`}>
                {item}
              </Box>
            ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;





