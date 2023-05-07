import React from 'react'
import { Grid, Flex } from '@chakra-ui/react'
import PrelaunchGridItem from './PrelaunchGridItem'

const PrelaunchGrid = () => {
  return (
    <Grid
      templateAreas={`
        "cta main"
        "cta background"`}
      gridTemplateRows={'1fr'}
      gridTemplateColumns={'450px 1fr'}
      h="1000px"
      color="blackAlpha.700"
      fontWeight="bold"
      mt="10px"
    >
      <PrelaunchGridItem placement="2" backgroundColor="white" areaProp="cta" />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="white"
        areaProp="main"
      />
      <PrelaunchGridItem backgroundColor="red" areaProp="background"/>
    </Grid>
  )
}

export default PrelaunchGrid
