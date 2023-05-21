import { useState } from 'react';
import { Card, CardBody, CardHeader, Heading, Text, CardFooter, Button, Icon, Flex, Center } from '@chakra-ui/react';
import { CardData } from '../types';
import useMobileCheck from '../../hooks/useMobileCheck';

interface PrelaunchCardProps {
  data: CardData;
}

const PrelaunchCard = ({ data }: PrelaunchCardProps) => {
  const { header, body, buttonText, icon } = data;
  const isMobile = useMobileCheck();
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_MOBILE_BODY_LENGTH = 115; 

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderBodyText = () => {
    if (isMobile && body.length > MAX_MOBILE_BODY_LENGTH) {
      return (
        <>
          <Text>
            {isExpanded ? body : `${body.slice(0, MAX_MOBILE_BODY_LENGTH)}...`}
          </Text>
          <Text
            color="brand.green"
            fontSize='lg'
            fontWeight="bold"
            cursor="pointer"
            onClick={toggleExpand}
            mt={2}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </Text>
        </>
      );
    } else {
      return <Text>{body}</Text>;
    }
  };

  return (
    <Card
      w={isMobile ? "100%" : "400px"}
      mt={isMobile ? "4" : undefined}
      bg="white"
      borderRadius="md"
      boxShadow="lg"
      transition="box-shadow 0.2s"
      _hover={{
        boxShadow: "dark-lg",
      }}
      p={isMobile ? "5" : undefined}
    >
      <CardHeader bg="brand.lightGreen" borderRadius="md">
        <Flex align="center">
          <Icon as={icon} boxSize={8} mr={4} color="brand.green" />
          <Heading size="lg" display="inline-block">
            {header}
          </Heading>
        </Flex>
      </CardHeader>
      <CardBody p={isMobile ? "2" : "5"}>
        {renderBodyText()}
      </CardBody>
      <CardFooter justifyContent={isMobile ? "center" : undefined}>
        <Button>{buttonText}</Button>
      </CardFooter>
    </Card>
  );
};

export default PrelaunchCard;
