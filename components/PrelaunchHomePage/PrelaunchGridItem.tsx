import { GridItem } from '@chakra-ui/react'
import React from 'react'
import PrelaunchMain from './PrelaunchMain'
import PrelaunchCta from './PrelaunchCta'
import PrelaunchFooter from './PrelaunchFooter'
import PrelaunchHeader from './PrelaunchHeader'

type Props = {
  placement: string
  backgroundColor: string
  areaProp: string
}

const PrelaunchGridItem = ({ placement, backgroundColor, areaProp }: Props) => {
  const renderContent = () => {
    switch (areaProp) {
      case 'header':
        return <PrelaunchHeader />
      case 'cta':
        return <PrelaunchCta />
      case 'main':
        return <PrelaunchMain />
      case 'footer':
        return <PrelaunchFooter />
      default:
        return null
    }
  }
  return (
    <GridItem pl={placement} bg={backgroundColor} area={`${areaProp}`}>
      {renderContent()}
    </GridItem>
  )
}

export default PrelaunchGridItem
