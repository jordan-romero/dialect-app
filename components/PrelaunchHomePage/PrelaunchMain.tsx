/* eslint-disable react/no-children-prop */
import {
  Box,
  Text,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
} from '@chakra-ui/react'
import React from 'react'
import DialectVideo from './DialectVideo'

const PrelaunchMain = () => {
  const [value, setValue] = React.useState('')

  const handleChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => setValue(event.target.value)

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`The name you entered was: ${name}`)
  }

  return (
    <Box textAlign="center" h="500px">
      <DialectVideo />
      <Text>
        Russian blue i is not fat, i is fluffy one of these days im going to get
        that red dot, just you wait and see Cat ipsum dolor sit amet, pretend
        you want to go out but then dont. All of a sudden cat goes crazy. Stare
        at guinea pigs Gate keepers of hell or get scared by sudden appearance
        of cucumber or meow, and leave hair everywhere, so eat an easter feather
        as if it were a bird then burp victoriously, but tender yet attack feet.
        Stand in doorway, unwilling to chose whether to stay in or go out human
        is washing you why halp oh the horror flee scratch hiss bite ha ha,
        youre funny ill kill you last.
      </Text>
      <Box as="form">
      <Text mt={10}>Sign up for this Dialect Class now and get 15% off!</Text>
      <InputGroup w="50%" mr="auto" ml="auto" mt={10}>
          <Input
            value={value}
            onChange={handleChange}
            placeholder="Here is a sample placeholder"
          />
        <InputRightAddon
          children="Suscribe Now"
          cursor="pointer"
          _hover={{ bg: 'blue.300' }}
        />
      </InputGroup>
      </Box>
    </Box>
  )
}

export default PrelaunchMain
