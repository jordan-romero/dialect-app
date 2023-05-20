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
          bg: "brand.green",
          color: "white",
          _hover: {
            bg: "brand.olive",
          },
          _active: {
            bg: "brand.lightGreen",
            color: "black",
          },
        },
      },
    },
  },
});

export default theme;

