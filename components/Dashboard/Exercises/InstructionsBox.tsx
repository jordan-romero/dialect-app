import React from 'react'
import {
  Box,
  Collapse,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { MdExpandLess, MdExpandMore } from 'react-icons/md'
import Callout from './Callout'
import { renderRich } from './UnderlineMarkup'

// The one look for every exercise's instructions: a small gray box led by a
// bold "Instructions:", all at one text size.
//
// Pass `text` (authored content) or `children` (wording built in code).
// Authored text keeps its nuance:
//   **bold**, _italic_, {underline}      (renderRich)
//   [label](https://…)                   a link
//   lines starting "1. ", "2. " …        a numbered list
//   blank line                           a new paragraph
//   a paragraph starting "Keep in mind:" or "Extra challenge:" shows as a
//   purple callout outside the box — above it when it comes first, below
//   it otherwise.

export const INSTRUCTIONS_FONT_SIZE = 'md'

const CALLOUT_PREFIXES = ['Keep in mind:', 'Extra challenge:']
const STEP = /^\d+\.\s+/
const LINK = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g
const LINK_PARTS = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/

const calloutPrefixOf = (para: string) =>
  CALLOUT_PREFIXES.find((prefix) => para.startsWith(prefix))

/** Markdown-style links plus renderRich's bold / italic / underline. */
export const renderInstructionText = (text: string): React.ReactNode =>
  text.split(LINK).map((part, i) => {
    const m = part.match(LINK_PARTS)
    return m ? (
      <Link
        key={i}
        href={m[2]}
        isExternal
        color="brand.iris"
        textDecoration="underline"
        fontWeight="semibold"
      >
        {m[1]}
      </Link>
    ) : (
      <React.Fragment key={i}>{renderRich(part)}</React.Fragment>
    )
  })

const Label = () => (
  <Text as="span" fontWeight="bold">
    Instructions:
  </Text>
)

const Paragraph: React.FC<{ para: string; withLabel: boolean }> = ({
  para,
  withLabel,
}) => {
  const lines = para.split('\n')
  const lead = lines.filter((l) => !STEP.test(l)).join(' ')
  const steps = lines.filter((l) => STEP.test(l))
  return (
    <Box>
      {(withLabel || lead) && (
        <Text>
          {withLabel && <Label />}
          {withLabel && lead ? ' ' : ''}
          {renderInstructionText(lead)}
        </Text>
      )}
      {steps.length > 0 && (
        <OrderedList mt={1} spacing={1}>
          {steps.map((step, n) => (
            <ListItem key={n}>
              {renderInstructionText(step.replace(STEP, ''))}
            </ListItem>
          ))}
        </OrderedList>
      )}
    </Box>
  )
}

interface InstructionsBoxProps {
  /** Authored instructions (see the markup above). */
  text?: string | null
  /** Wording built in code; follows the "Instructions:" label inline. */
  children?: React.ReactNode
  /** Starts open; the learner can fold it away (Repeat After Me). */
  collapsible?: boolean
  mb?: number
}

const InstructionsBox: React.FC<InstructionsBoxProps> = ({
  text,
  children,
  collapsible = false,
  mb,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

  const paras = (text ?? '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
  const firstPlain = paras.findIndex((p) => !calloutPrefixOf(p))
  const before = firstPlain === -1 ? paras : paras.slice(0, firstPlain)
  const plain =
    firstPlain === -1 ? [] : paras.filter((p) => !calloutPrefixOf(p))
  const after =
    firstPlain === -1
      ? []
      : paras.slice(firstPlain).filter((p) => calloutPrefixOf(p))

  const hasBody = plain.length > 0 || children != null
  if (!hasBody && before.length === 0) return null

  const callout = (para: string, i: number) => {
    const prefix = calloutPrefixOf(para) as string
    return (
      <Callout key={i} tone="prompt" label={prefix.replace(/:$/, '')} mt={0}>
        {renderInstructionText(para.slice(prefix.length).trim())}
      </Callout>
    )
  }

  const body = (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      fontSize={INSTRUCTIONS_FONT_SIZE}
    >
      {children != null ? (
        <Text>
          {!collapsible && (
            <>
              <Label />{' '}
            </>
          )}
          {children}
        </Text>
      ) : (
        plain.map((para, i) => (
          <Paragraph key={i} para={para} withLabel={i === 0 && !collapsible} />
        ))
      )}
    </Box>
  )

  return (
    <Box display="flex" flexDirection="column" gap={3} mb={mb} width="100%">
      {before.map(callout)}
      {hasBody && (
        <Box
          bg="surface.subtle"
          p={3}
          borderRadius="lg"
          border="1px solid"
          borderColor="border.subtle"
          color="text.primary"
          width="100%"
        >
          {collapsible ? (
            <>
              <HStack
                as="button"
                w="100%"
                justify="space-between"
                onClick={onToggle}
                aria-expanded={isOpen}
                fontSize={INSTRUCTIONS_FONT_SIZE}
              >
                <Label />
                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
              </HStack>
              <Collapse in={isOpen} animateOpacity>
                <Box pt={2}>{body}</Box>
              </Collapse>
            </>
          ) : (
            body
          )}
        </Box>
      )}
      {after.map(callout)}
    </Box>
  )
}

export default InstructionsBox
