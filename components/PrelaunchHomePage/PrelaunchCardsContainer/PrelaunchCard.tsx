import { Card, CardBody, CardHeader, Heading, Text, CardFooter, Button, Icon, Flex } from '@chakra-ui/react'
import React from 'react'
import { CardData } from '../types';

interface PrelaunchCardProps {
    data: CardData;
  }
  
  const PrelaunchCard = ({ data }: PrelaunchCardProps) => {
    const { header, body, buttonText, icon } = data;
  
    return (
      <Card  w="400px"
      bg="white"
      borderRadius="md"
      boxShadow="lg"
      transition="box-shadow 0.2s"
      _hover={{
        boxShadow: "dark-lg",
      }}>
        <CardHeader bg='brand.lightGreen' borderRadius='md'>
        <Flex align='center'>
          <Icon as={icon} boxSize={8} mr={4} color="brand.green"  />
          <Heading size="lg" display="inline-block">
            {header}
          </Heading>
        </Flex>
      </CardHeader>
        <CardBody p='5'>
          <Text>{body}</Text>
        </CardBody>
        <CardFooter>
          <Button>{buttonText}</Button>
        </CardFooter>
      </Card>
    );
  };

export default PrelaunchCard