import { extendTheme, theme as base } from '@chakra-ui/react'

const theme = extendTheme({
  // Light by default. Dark mode is opt-in (the dashboard Profile toggle) and
  // only restyles components that explicitly use color-mode values — the body
  // is pinned so the public site and lesson content stay light & readable.
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: { bg: 'white', color: 'gray.800' },
    },
  },
  colors: {
    brand: {
      purple: '#723FC5',
      purpleLight: '#8A2DBB',
      iris: '#5F53CF',
      blue: '#7EACE2',
      blueLight: '#B1F5F4',
    },
    util: {
      white: '#ffffff',
      black: '#000000',
      gray: '#f5f5f5',
      darkGray: '#333333',
      mediumGray: '#999999',
    },
    lesson: {
      completed: '#B1F5F4',
      inProgress: '#7EACE2',
      notStarted: '#ffffff',
    },
  },
  fonts: {
    heading: `Arimo, ${base.fonts?.heading}`,
    body: `Arimo, ${base.fonts?.body}`,
    longBody: `Charis SIL, serif`,
    ipa: `'Charis SIL', 'Doulos SIL', 'Noto Sans', 'DejaVu Sans', serif`,
  },
  components: {
    Button: {
      variants: {
        brandBold: {
          bg: 'brand.iris',
          color: 'white',
          _hover: {
            bg: 'brand.purple',
          },
          _active: {
            bg: 'util.white',
            color: 'brand.blue',
          },
        },
        brandWhite: {
          bg: 'white',
          color: 'brand.iris',
          _hover: {
            bg: 'brand.iris',
            color: 'white',
          },
          _active: {
            bg: 'brand.blueLight',
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
            bg: 'brand.blueLight',
            color: 'black',
          },
        },
      },
    },
  },
})

export default theme
