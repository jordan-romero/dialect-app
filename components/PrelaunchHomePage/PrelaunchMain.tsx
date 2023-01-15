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

  // const handleSubmit = (event) => {
  //   event.preventDefault()
  //   alert(`The name you entered was: ${name}`)
  // }

  return (
    <Box pt={6}>
      <DialectVideo />
    </Box>
  )
}

export default PrelaunchMain
