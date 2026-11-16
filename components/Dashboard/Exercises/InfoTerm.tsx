import React from 'react'
import { Text, TextProps, Tooltip } from '@chakra-ui/react'

// A label with a definition behind it (chart headers, articulation names): a
// dashed underline says "there's more here", and hover/focus tints it before
// the tooltip opens. Keyboard users reach it with Tab.

interface InfoTermProps extends Omit<TextProps, 'children'> {
  definition?: string
  children: React.ReactNode
}

const InfoTerm: React.FC<InfoTermProps> = ({ definition, children, ...rest }) =>
  definition ? (
    <Tooltip label={definition} hasArrow openDelay={150}>
      <Text
        as="span"
        tabIndex={0}
        cursor="help"
        px={1}
        mx={-1}
        borderRadius="sm"
        textDecoration="underline"
        textDecorationStyle="dashed"
        textDecorationColor="brand.iris"
        textUnderlineOffset="4px"
        transition="color 0.15s ease, background-color 0.15s ease"
        _hover={{ color: 'brand.iris', bg: 'accent.subtle' }}
        _focusVisible={{
          color: 'brand.iris',
          bg: 'accent.subtle',
          outline: '2px solid',
          outlineColor: 'brand.iris',
        }}
        {...rest}
      >
        {children}
      </Text>
    </Tooltip>
  ) : (
    <>{children}</>
  )

export default InfoTerm
