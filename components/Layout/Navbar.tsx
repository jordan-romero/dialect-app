import { HamburgerIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, HStack, IconButton, Menu, MenuItem, MenuButton, MenuList, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import useMobileCheck from '../hooks/useMobileCheck';

const Navbar = () => {
  const isMobile = useMobileCheck();

  if (isMobile) {
    return <MobileNavbar />;
  }

  return (
    <Flex w="100%" h="14" align="center">
      <HStack w="100%" spacing={0} justify="space-between">
        <HStack align="center">
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
  const [menuItems, setMenuItems] = useState(['home', 'about', 'testimonials', 'contact']);

  return (
    <Box>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Toggle menu"
          icon={<HamburgerIcon />}
          variant="ghost"
        />

        <MenuList>
          <VStack p="4" spacing="4">
            {menuItems.map((item, index) => (
              <MenuItem key={index} onClick={() => window.location.href = `/${item}`} textTransform="capitalize">
                {item}
              </MenuItem>
            ))}
          </VStack>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default Navbar;






