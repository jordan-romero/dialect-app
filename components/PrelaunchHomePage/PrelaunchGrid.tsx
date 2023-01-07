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
      color="blackAlpha.700"
      fontWeight="bold"
    >
      <PrelaunchGridItem
        placement="2"
        backgroundColor="gray.200"
        areaProp="header"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="gray.50"
        areaProp="cta"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="blue.300"
        areaProp="main"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="gray.100"
        areaProp="footer"
      />
    </Grid>
  )
}

export default PrelaunchGrid
