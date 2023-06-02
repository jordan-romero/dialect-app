import { extendTheme, theme as base } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      purple: '#552b53',
      pink: '#bb77b8',
      green: '#83994d',
      lightGreen: '#f1f5ef',
      olive: '#5f6b36',
    },
    util: {
      white: '#ffffff',
      black: '#000000',
      gray: '#f5f5f5',
      darkGray: '#333333',
      mediumGray: '#999999',
    },
  },
  fonts: {
    heading: `Arimo, ${base.fonts?.heading}`,
    body: `Arimo, ${base.fonts?.heading}`,
    longBody: `Charis SIL,, serif`,
  },
  components: {
    Button: {
      variants: {
        brandBold: {
          bg: 'brand.green',
          color: 'white',
          _hover: {
            bg: 'brand.olive',
          },
          _active: {
            bg: 'brand.lightGreen',
            color: 'black',
          },
        },
        brandWhite: {
          bg: 'white',
          color: 'brand.olive',
          _hover: {
            bg: 'brand.green',
            color: 'white',
          },
          _active: {
            bg: 'brand.lightGreen',
            color: 'black',
          },
        },
        brandGhost: {
          bg: 'util.lightGray',
          color: 'brand.purple',
          _hover: {
            bg: 'brand.purple',
            color: 'util.white',
          },
          _active: {
            bg: 'brand.lightGreen',
            color: 'black',
          },
        },
      },
    },
  },
})

export default theme
