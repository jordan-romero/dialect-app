import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Box, Flex, Text, IconButton, Icon } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import {
  MdClose,
  MdDragIndicator,
  MdKeyboard,
  MdOpenInFull,
} from 'react-icons/md'
import { IPAKeyboard } from './IPAKeyboard'

/**
 * Floating, draggable + resizable "picture-in-picture" IPA keyboard.
 *
 * Any text field marked with `data-ipa-field` registers itself as the active
 * target when focused. Clicking a key in the PIP inserts that symbol at the
 * caret of the active field (NOT into the PIP itself) and fires a native input
 * event so React state updates exactly as if the user had typed it.
 *
 * Focus is preserved by preventing the default mousedown inside the keyboard
 * body, so the external field never blurs while you click symbols.
 */

type IpaKeyboardContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const IpaKeyboardContext = createContext<IpaKeyboardContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
})

export const useIpaKeyboard = () => useContext(IpaKeyboardContext)

const popIn = keyframes`
  0% { opacity: 0; transform: translateY(12px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`

// Wide, keyboard-shaped default. User can drag the corner to resize.
const DEFAULT_W = 880
const DEFAULT_H = 540
const MIN_W = 520
const MIN_H = 300

type EditableEl = HTMLInputElement | HTMLTextAreaElement

const insertAtCaret = (el: EditableEl, symbol: string) => {
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const next = el.value.slice(0, start) + symbol + el.value.slice(end)

  // Use the native value setter so React's controlled-input tracker notices
  // the change when we dispatch the input event.
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (setter) setter.call(el, next)
  else el.value = next

  el.dispatchEvent(new Event('input', { bubbles: true }))

  const caret = start + symbol.length
  // Keep focus + caret on the external field for continuous typing.
  el.focus()
  try {
    el.setSelectionRange(caret, caret)
  } catch {
    /* some input types don't support selection range */
  }
}

export const IpaKeyboardProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })
  // Once the user explicitly closes it, don't auto-reopen on the next focus.
  const dismissedRef = useRef(false)

  const activeFieldRef = useRef<EditableEl | null>(null)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const resizeRef = useRef<{
    startX: number
    startY: number
    startW: number
    startH: number
  } | null>(null)

  // Live mirrors so the global pointer listeners read current values.
  const posRef = useRef(pos)
  posRef.current = pos
  const sizeRef = useRef(size)
  sizeRef.current = size

  useEffect(() => setMounted(true), [])

  const clampPos = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y }
    const { w } = sizeRef.current
    const maxX = window.innerWidth - w - 12
    const maxY = window.innerHeight - 60
    return {
      x: Math.max(12, Math.min(x, maxX)),
      y: Math.max(12, Math.min(y, maxY)),
    }
  }, [])

  const ensurePosition = useCallback(() => {
    setPos((prev) => {
      if (prev) return prev
      if (typeof window === 'undefined') return { x: 24, y: 24 }
      const { w, h } = sizeRef.current
      return {
        x: Math.max(12, window.innerWidth - w - 24),
        y: Math.max(12, window.innerHeight - h - 80),
      }
    })
  }, [])

  const open = useCallback(() => {
    dismissedRef.current = false
    ensurePosition()
    setIsOpen(true)
  }, [ensurePosition])

  const close = useCallback(() => {
    dismissedRef.current = true
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, open, close])

  // Track the last-focused IPA field; auto-open the PIP the first time one is
  // focused (unless the user has dismissed it).
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      if (
        (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) &&
        t.matches('[data-ipa-field]')
      ) {
        activeFieldRef.current = t
        if (!dismissedRef.current && !isOpen) {
          ensurePosition()
          setIsOpen(true)
        }
      }
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [isOpen, ensurePosition])

  // Drag (header) + resize (corner) handling.
  useEffect(() => {
    if (!isOpen) return
    const onMove = (e: PointerEvent) => {
      if (dragRef.current) {
        setPos(
          clampPos(
            e.clientX - dragRef.current.dx,
            e.clientY - dragRef.current.dy,
          ),
        )
      } else if (resizeRef.current) {
        const r = resizeRef.current
        const p = posRef.current
        const maxW =
          typeof window !== 'undefined'
            ? window.innerWidth - (p?.x ?? 12) - 12
            : Infinity
        const maxH =
          typeof window !== 'undefined'
            ? window.innerHeight - (p?.y ?? 12) - 12
            : Infinity
        const w = Math.max(
          MIN_W,
          Math.min(r.startW + (e.clientX - r.startX), maxW),
        )
        const h = Math.max(
          MIN_H,
          Math.min(r.startH + (e.clientY - r.startY), maxH),
        )
        setSize({ w, h })
      }
    }
    const onUp = () => {
      dragRef.current = null
      resizeRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isOpen, clampPos])

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if (!pos) return
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
  }

  const onResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
    }
  }

  const handleSymbol = useCallback((symbol: string) => {
    const el = activeFieldRef.current
    if (!el) return
    insertAtCaret(el, symbol)
  }, [])

  const ctx: IpaKeyboardContextValue = { isOpen, open, close, toggle }

  return (
    <IpaKeyboardContext.Provider value={ctx}>
      {children}
      {mounted &&
        isOpen &&
        pos &&
        createPortal(
          <Box
            position="fixed"
            top={`${pos.y}px`}
            left={`${pos.x}px`}
            zIndex={3000}
            w={`${size.w}px`}
            h={`${size.h}px`}
            maxW="calc(100vw - 24px)"
            maxH="calc(100vh - 24px)"
            display="flex"
            flexDirection="column"
            bg="white"
            borderRadius="2xl"
            boxShadow="0 24px 60px rgba(15, 23, 42, 0.28)"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            animation={`${popIn} 0.2s cubic-bezier(0.22,1,0.36,1)`}
          >
            {/* Drag handle / header */}
            <Flex
              align="center"
              gap={2}
              px={3}
              py={2}
              flexShrink={0}
              bgGradient="linear(to-r, brand.iris, #7C5CFF)"
              color="white"
              cursor="grab"
              onPointerDown={onHeaderPointerDown}
              sx={{ touchAction: 'none' }}
              _active={{ cursor: 'grabbing' }}
            >
              <Icon as={MdDragIndicator} boxSize={5} opacity={0.85} />
              <Icon as={MdKeyboard} boxSize={5} />
              <Text fontWeight="bold" fontSize="sm" flex="1">
                IPA Keyboard
              </Text>
              <IconButton
                aria-label="Close keyboard"
                icon={<MdClose />}
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
                onClick={close}
              />
            </Flex>

            {/* Keyboard body. Prevent mousedown default so clicking keys never
                steals focus from the external IPA field being typed into. */}
            <Box
              flex="1"
              minH={0}
              overflowY="auto"
              p={2}
              onMouseDownCapture={(e) => e.preventDefault()}
            >
              <IPAKeyboard
                onSymbolClick={handleSymbol}
                showTextArea={false}
                hideInstructions
                persistClickedSymbols={false}
                title="IPA Keyboard"
              />
            </Box>

            {/* Resize handle (bottom-right corner) */}
            <Box
              position="absolute"
              bottom="2px"
              right="2px"
              p={1}
              color="gray.400"
              cursor="nwse-resize"
              onPointerDown={onResizePointerDown}
              sx={{ touchAction: 'none' }}
              _hover={{ color: 'brand.iris' }}
              title="Drag to resize"
            >
              <Icon as={MdOpenInFull} boxSize={3.5} transform="rotate(90deg)" />
            </Box>
          </Box>,
          document.body,
        )}
    </IpaKeyboardContext.Provider>
  )
}

export default IpaKeyboardProvider
