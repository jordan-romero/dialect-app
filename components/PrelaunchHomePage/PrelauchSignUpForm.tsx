/* eslint-disable react/no-children-prop */
import { Box, Text, InputGroup, Input, InputRightAddon } from '@chakra-ui/react'
import React from 'react'

const PrelauchSignUpForm = () => {
    const [value, setValue] = React.useState('')

    const handleChange = (event: {
      target: { value: React.SetStateAction<string> }
    }) => setValue(event.target.value)
  
    // const handleSubmit = (event) => {
    //   event.preventDefault()
    //   alert(`The name you entered was: ${name}`)
    // }

  return (
    <Box as="form">
        <Text mt={6} textAlign="center">
          Sign up for this Dialect Class now and get 15% off!
        </Text>
        <InputGroup w="50%" mr="auto" ml="auto" mt={10}>
          <Input
            value={value}
            onChange={handleChange}
            placeholder="Email"
            color="gray.600"
            variant="outline"
            bg="white"
          />
          <InputRightAddon
            children="Suscribe Now"
            cursor="pointer"
            _hover={{ bg: 'green.300', color: 'white' }}
          />
        </InputGroup>
      </Box>
  )
}

export default PrelauchSignUpForm