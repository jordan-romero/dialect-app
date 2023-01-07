import React from 'react'
import { Grid } from '@chakra-ui/react'
import PrelaunchGridItem from './PrelaunchGridItem'

const PrelaunchGrid = () => {
  return (
    <Grid
      templateAreas={`"header header"
    "cta main"
    "cta footer"`}
      gridTemplateRows={'100px 1fr 60px'}
      gridTemplateColumns={'450px 1fr'}
      h="1000px"
      gap="1"
      color="blackAlpha.700"
      fontWeight="bold"
    >
      <PrelaunchGridItem
        placement="2"
        backgroundColor="orange.300"
        areaProp="header"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="pink.300"
        areaProp="cta"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="green.300"
        areaProp="main"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="blue.300"
        areaProp="footer"
      />
    </Grid>
  )
}

export default PrelaunchGrid
