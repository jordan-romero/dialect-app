import { Card, CardBody, Heading, Text, Link, Button, Image } from '@chakra-ui/react';
import React from 'react';
import { Coach } from '../types';

interface AboutCardProps extends Coach {}

const AboutCard: React.FC<AboutCardProps> = ({ name, title, bio, photoSrc, website }) => {
  return (
    <Card maxW="sm">
      <Image src={photoSrc} alt={name} objectFit="cover" h="200px" />
      <CardBody>
        <Heading as="h3" size="md" mb={2}>
          {name}
        </Heading>
        <Text color="gray.500" fontSize="sm" mb={2}>
          {title}
        </Text>
        <Text mb={4}>{bio}</Text>
        <Link href={website} isExternal>
          <Button colorScheme="blue">Visit Website</Button>
        </Link>
      </CardBody>
    </Card>
  );
};

export default AboutCard;
