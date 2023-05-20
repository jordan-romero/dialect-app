import React, { useState } from 'react';
import { Box, Input, Button, useToast, Heading } from '@chakra-ui/react';
import { EmailIcon } from '@chakra-ui/icons';

const PrelaunchCta = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Email is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEmail('');
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while subscribing. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w='55%'>
      <Heading fontSize="2xl" mb='7'>Sign up now for an Early Bird Discount!</Heading>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        mb={4}
        isRequired
        borderRadius="md"
        borderColor="brand.green"
        _placeholder={{ color: "gray.400" }}
        _focus={{ borderColor: "brand.olive", boxShadow: "outline" }}
        _hover={{ bg: "gray.200" }}
      />
      <Button leftIcon={<EmailIcon />} type="submit" variant='brandBold' mt='5'>
        Sign up now
      </Button>
    </Box>
  );
};

export default PrelaunchCta;