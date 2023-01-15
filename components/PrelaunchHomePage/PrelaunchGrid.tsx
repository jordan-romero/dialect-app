import React from 'react'
import { Grid } from '@chakra-ui/react'
import PrelaunchGridItem from './PrelaunchGridItem'

const PrelaunchGrid = () => {
  return (
    <Grid
      templateAreas={`
        "cta main"
        "cta footer"`}
      gridTemplateRows={'1fr 260px'}
      gridTemplateColumns={'450px 1fr'}
      h="1000px"
      color="blackAlpha.700"
      fontWeight="bold"
      mt='10px'
    >
      <PrelaunchGridItem placement="2" backgroundColor="white" areaProp="cta" />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="white"
        areaProp="main"
      />
      <PrelaunchGridItem
        placement="2"
        backgroundColor="white"
        areaProp="footer"
      />
    </Grid>
  )
}

export default PrelaunchGrid
