import {
  VStack,
  Text,
  HStack,
  Flex,
  Spacer,
  Heading,
  SimpleGrid,
  Card,
  CardFooter,
  Button,
  CardBody,
  CardHeader,
} from '@chakra-ui/react'
import React from 'react'
import { ArrowRightIcon, MoonIcon, RepeatIcon } from '@chakra-ui/icons'

const PrelaunchFooter = () => {
  return (
    <SimpleGrid spacing={4} templateColumns="repeat(3, minmax(200px, 1fr))">
      <Card>
        <CardHeader>
          <Heading size="md"> Customer dashboard</Heading>
        </CardHeader>
        <CardBody>
          <Text>View a summary of all your customers over the last month.</Text>
        </CardBody>
        <CardFooter>
          <Button>View here</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <Heading size="md"> Customer dashboard</Heading>
        </CardHeader>
        <CardBody>
          <Text>View a summary of all your customers over the last month.</Text>
        </CardBody>
        <CardFooter>
          <Button>View here</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <Heading size="md"> Customer dashboard</Heading>
        </CardHeader>
        <CardBody>
          <Text>View a summary of all your customers over the last month.</Text>
        </CardBody>
        <CardFooter>
          <Button>View here</Button>
        </CardFooter>
      </Card>
    </SimpleGrid>
  )
}

export default PrelaunchFooter
