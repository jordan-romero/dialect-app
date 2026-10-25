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
  // Dark-mode-aware design tokens. The public site & lesson content stay light
  // (the body is pinned above); the DASHBOARD opts in by using these tokens, so
  // flipping color mode restyles the whole dashboard from one source of truth.
  semanticTokens: {
    colors: {
      'surface.canvas': { default: 'gray.50', _dark: 'gray.900' }, // page background
      'surface.card': { default: 'white', _dark: 'gray.800' }, // cards / panels
      'surface.subtle': { default: 'gray.50', _dark: 'gray.700' }, // inset boxes
      'surface.hover': { default: 'gray.50', _dark: 'whiteAlpha.100' }, // row hover
      'accent.subtle': {
        default: 'purple.50',
        _dark: 'rgba(149,128,255,0.16)',
      }, // current/selected row tint
      'surface.rail': { default: 'brand.purple', _dark: '#1E1B33' }, // side rail
      'text.primary': { default: 'gray.800', _dark: 'gray.100' },
      'text.muted': { default: 'gray.500', _dark: 'gray.400' },
      'border.subtle': { default: 'gray.200', _dark: 'whiteAlpha.300' },
      // IPA keyboard key highlights — bright in light mode, gently tinted in dark.
      'symbol.used': {
        default: 'brand.blue',
        _dark: 'rgba(126,172,226,0.22)',
      }, // previously-clicked
      'symbol.selected': {
        default: 'brand.blueLight',
        _dark: 'rgba(149,128,255,0.34)',
      }, // currently cycling
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
