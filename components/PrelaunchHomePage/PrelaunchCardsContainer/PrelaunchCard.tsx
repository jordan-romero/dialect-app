import { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  CardFooter,
  Button,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { CardData } from '../types'
import useMobileCheck from '../../hooks/useMobileCheck'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'

interface PrelaunchCardProps {
  data: CardData
  setIsContainerExpanded: (isContainerExpanded: boolean) => void
}

const PrelaunchCard = ({ data, setIsContainerExpanded }: PrelaunchCardProps) => {
  const { header, body, buttonText, icon, href } = data
  const isMobile = useMobileCheck()
  const isMidSized = useMidSizeCheck()
  const [isCardExpanded, setIsCardExpanded] = useState(false)
  const MAX_MOBILE_BODY_LENGTH = 115

  const toggleExpand = () => {
    setIsCardExpanded(!isCardExpanded)
    setIsContainerExpanded(true)
  }

  const renderBodyText = () => {
    if (isMobile && body.length > MAX_MOBILE_BODY_LENGTH) {
      return (
        <>
          <Text>
            {isCardExpanded ? body : `${body.slice(0, MAX_MOBILE_BODY_LENGTH)}...`}
          </Text>
          <Text
            color="brand.purple"
            fontSize="lg"
            fontWeight="bold"
            cursor="pointer"
            onClick={toggleExpand}
            mt={2}
          >
            {isCardExpanded ? 'Read less' : 'Read more'}
          </Text>
        </>
      )
    } else {
      return <Text>{body}</Text>
    }
  }

  return (
    <Card
      w={isMidSized ? '100%' : '400px'}
      mt={isMidSized ? '4' : undefined}
      bg="white"
      borderRadius="md"
      boxShadow="lg"
      transition="box-shadow 0.2s"
      _hover={{
        boxShadow: 'dark-lg',
      }}
      p={isMidSized ? '5' : undefined}
    >
      <CardHeader bg="util.gray" borderRadius="md">
        <Flex align="center">
          <Icon as={icon} boxSize={8} mr={4} color="brand.purple" />
          <Heading size="lg" display="inline-block">
            {header}
          </Heading>
        </Flex>
      </CardHeader>
      <CardBody p={isMidSized ? '2' : '5'}>{renderBodyText()}</CardBody>
      <CardFooter justifyContent={isMidSized ? 'center' : undefined}>
        <Button as="a" href={href} variant="brandWhite">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PrelaunchCard
