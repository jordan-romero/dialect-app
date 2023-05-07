import { extendTheme, theme as base } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      purple: "#552b53",
      pink: "#bb77b8", 
      green: "#83994d", 
      lightGreen: "#f1f5ef", 
      olive: "#5f6b36",
    },
  },
  fonts: {
    heading: `Poppins, ${base.fonts?.heading}`,
    body: `Lato, ${base.fonts?.body}`,
  },
})

export default theme
