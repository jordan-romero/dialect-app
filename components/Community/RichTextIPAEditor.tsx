import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  useToast,
  Divider,
} from '@chakra-ui/react'
import { CopyIcon, RepeatIcon, RepeatClockIcon } from '@chakra-ui/icons'
import {
  RiBold,
  RiItalic,
  RiUnderline,
  RiStrikethrough,
  RiSubscript,
  RiSuperscript,
  RiDeleteBin6Line,
} from 'react-icons/ri'

interface RichTextIPAEditorProps {
  onSymbolInsert?: (symbol: string) => void
  onClear?: () => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
}

type FormatCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'subscript'
  | 'superscript'

export const RichTextIPAEditor = forwardRef<any, RichTextIPAEditorProps>(
  (
    {
      onSymbolInsert,
      onClear,
      placeholder = 'Type or click symbols to create IPA transcription...',
      minHeight = '200px',
      maxHeight = '400px',
    },
    ref,
  ) => {
    const STORAGE_KEY = 'ipa-richtext-content'
    const editorRef = useRef<HTMLDivElement>(null)
    const [activeFormats, setActiveFormats] = useState<Set<FormatCommand>>(
      new Set(),
    )
    const [history, setHistory] = useState<string[]>([''])
    const [historyIndex, setHistoryIndex] = useState(0)
    const toast = useToast()

    // Load saved content from localStorage on mount
    useEffect(() => {
      if (typeof window !== 'undefined' && editorRef.current) {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          editorRef.current.innerHTML = saved
          setHistory([saved])
          setHistoryIndex(0)
        }
      }
    }, [])

    // Save content to localStorage on changes (debounced)
    useEffect(() => {
      if (typeof window !== 'undefined' && editorRef.current) {
        const content = editorRef.current.innerHTML
        // Only save if there's actual content (not just empty tags)
        if (content && content.trim() !== '') {
          const timeoutId = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, content)
          }, 500) // Debounce 500ms

          return () => clearTimeout(timeoutId)
        }
      }
    }, [history, historyIndex])

    // Update active formats based on cursor position
    const updateActiveFormats = useCallback(() => {
      const formats = new Set<FormatCommand>()

      if (document.queryCommandState('bold')) formats.add('bold')
      if (document.queryCommandState('italic')) formats.add('italic')
      if (document.queryCommandState('underline')) formats.add('underline')
      if (document.queryCommandState('strikeThrough'))
        formats.add('strikethrough')
      if (document.queryCommandState('subscript')) formats.add('subscript')
      if (document.queryCommandState('superscript')) formats.add('superscript')

      setActiveFormats(formats)
    }, [])

    // Save to history
    const saveToHistory = useCallback(() => {
      if (!editorRef.current) return

      const content = editorRef.current.innerHTML
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(content)

      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift()
      } else {
        setHistoryIndex(historyIndex + 1)
      }

      setHistory(newHistory)
    }, [history, historyIndex])

    // Undo/Redo
    const handleUndo = useCallback(() => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        if (editorRef.current) {
          editorRef.current.innerHTML = history[newIndex]
        }
      }
    }, [historyIndex, history])

    const handleRedo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        if (editorRef.current) {
          editorRef.current.innerHTML = history[newIndex]
        }
      }
    }, [historyIndex, history])

    // Clear content
    const handleClear = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        saveToHistory()
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
        }
        // Notify parent component to clear symbol history
        if (onClear) {
          onClear()
        }
      }
    }, [saveToHistory, onClear])

    // Execute formatting command
    const executeCommand = useCallback(
      (command: FormatCommand) => {
        const editor = editorRef.current
        if (!editor) return

        // Restore selection if it exists
        const selection = window.getSelection()

        // Focus the editor
        editor.focus()

        // Execute the command
        switch (command) {
          case 'bold':
            document.execCommand('bold', false, undefined)
            break
          case 'italic':
            document.execCommand('italic', false, undefined)
            break
          case 'underline':
            document.execCommand('underline', false, undefined)
            break
          case 'strikethrough':
            document.execCommand('strikeThrough', false, undefined)
            break
          case 'subscript':
            document.execCommand('subscript', false, undefined)
            break
          case 'superscript':
            document.execCommand('superscript', false, undefined)
            break
        }

        updateActiveFormats()

        // Small delay before saving to history to ensure DOM is updated
        setTimeout(() => {
          saveToHistory()
        }, 10)
      },
      [updateActiveFormats, saveToHistory],
    )

    // Handle input changes
    const handleInput = useCallback(() => {
      updateActiveFormats()
      saveToHistory()
    }, [updateActiveFormats, saveToHistory])

    // Insert IPA symbol at cursor with T9-style replacement support
    const insertSymbol = useCallback(
      (symbol: string, shouldReplace: boolean = false) => {
        const editor = editorRef.current
        if (!editor) return

        editor.focus()

        // Get selection and insert symbol
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)

          // If shouldReplace is true, try to delete the previous character (for T9 cycling)
          if (shouldReplace && range.collapsed) {
            // Move range start back by one character to delete previous symbol
            const startContainer = range.startContainer
            const startOffset = range.startOffset

            if (startOffset > 0) {
              // Delete previous character
              range.setStart(startContainer, startOffset - 1)
              range.deleteContents()
            }
          } else if (!shouldReplace) {
            // Not replacing, just delete any selected content
            range.deleteContents()
          }

          const textNode = document.createTextNode(symbol)
          range.insertNode(textNode)

          // Move cursor after inserted symbol
          range.setStartAfter(textNode)
          range.setEndAfter(textNode)
          selection.removeAllRanges()
          selection.addRange(range)
        } else {
          // If no selection, insert at end
          editor.appendChild(document.createTextNode(symbol))
        }

        saveToHistory()

        if (onSymbolInsert) {
          onSymbolInsert(symbol)
        }
      },
      [onSymbolInsert, saveToHistory],
    )

    // Handle keyboard shortcuts - Use Ctrl+Shift for formatting and undo/redo to avoid IPA keyboard conflicts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle shortcuts if we're focused in this editor
        if (document.activeElement !== editorRef.current) return

        if (e.ctrlKey || e.metaKey) {
          // Formatting and undo/redo shortcuts use Ctrl+Shift+Key
          if (e.shiftKey) {
            switch (e.key.toLowerCase()) {
              case 'b':
                e.preventDefault()
                e.stopPropagation()
                executeCommand('bold')
                break
              case 'i':
                e.preventDefault()
                e.stopPropagation()
                executeCommand('italic')
                break
              case 'u':
                e.preventDefault()
                e.stopPropagation()
                executeCommand('underline')
                break
              case 'z':
                // Ctrl+Shift+Z is undo
                e.preventDefault()
                e.stopPropagation()
                handleUndo()
                break
              case 'y':
                // Ctrl+Shift+Y is redo
                e.preventDefault()
                e.stopPropagation()
                handleRedo()
                break
            }
          }
          // Let all Ctrl+Key (without Shift) pass through to allow native copy/paste
        }
        // Let all Alt+Key events pass through to IPA keyboard handler
      }

      const editor = editorRef.current
      if (editor) {
        editor.addEventListener('keydown', handleKeyDown)
        return () => editor.removeEventListener('keydown', handleKeyDown)
      }
    }, [executeCommand, handleRedo, handleUndo])

    // Expose insertSymbol method via ref
    useImperativeHandle(
      ref,
      () => ({
        insertSymbol,
        getContent: () => editorRef.current?.innerHTML || '',
        getTextContent: () => editorRef.current?.innerText || '',
        clear: handleClear,
      }),
      [insertSymbol, handleClear],
    )

    // Copy to clipboard
    const handleCopy = async () => {
      if (!editorRef.current) return

      try {
        const text = editorRef.current.innerText
        await navigator.clipboard.writeText(text)
        toast({
          title: 'Copied to clipboard',
          description: 'IPA text has been copied',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: 'Copy failed',
          description: 'Unable to copy to clipboard',
          status: 'error',
          duration: 2000,
          isClosable: true,
        })
      }
    }

    return (
      <VStack spacing={0} align="stretch" w="full">
        {/* Formatting Toolbar */}
        <Box
          bg="white"
          borderBottom="2px solid"
          borderColor="gray.200"
          px={3}
          py={2}
          borderTopRadius="lg"
        >
          <HStack spacing={1} wrap="wrap">
            {/* Text Formatting */}
            <Tooltip label="Bold (Ctrl+Shift+B)">
              <IconButton
                aria-label="Bold"
                icon={<Box as={RiBold} boxSize={5} />}
                size="sm"
                variant={activeFormats.has('bold') ? 'solid' : 'ghost'}
                colorScheme={activeFormats.has('bold') ? 'purple' : 'gray'}
                onClick={() => executeCommand('bold')}
                _hover={{
                  bg: activeFormats.has('bold') ? 'purple.600' : 'gray.100',
                }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label="Italic (Ctrl+Shift+I)">
              <IconButton
                aria-label="Italic"
                icon={<Box as={RiItalic} boxSize={5} />}
                size="sm"
                variant={activeFormats.has('italic') ? 'solid' : 'ghost'}
                colorScheme={activeFormats.has('italic') ? 'purple' : 'gray'}
                onClick={() => executeCommand('italic')}
                _hover={{
                  bg: activeFormats.has('italic') ? 'purple.600' : 'gray.100',
                }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label="Underline (Ctrl+Shift+U)">
              <IconButton
                aria-label="Underline"
                icon={<Box as={RiUnderline} boxSize={5} />}
                size="sm"
                variant={activeFormats.has('underline') ? 'solid' : 'ghost'}
                colorScheme={activeFormats.has('underline') ? 'purple' : 'gray'}
                onClick={() => executeCommand('underline')}
                _hover={{
                  bg: activeFormats.has('underline')
                    ? 'purple.600'
                    : 'gray.100',
                }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label="Strikethrough">
              <IconButton
                aria-label="Strikethrough"
                icon={<Box as={RiStrikethrough} boxSize={5} />}
                size="sm"
                variant={activeFormats.has('strikethrough') ? 'solid' : 'ghost'}
                colorScheme={
                  activeFormats.has('strikethrough') ? 'purple' : 'gray'
                }
                onClick={() => executeCommand('strikethrough')}
                _hover={{
                  bg: activeFormats.has('strikethrough')
                    ? 'purple.600'
                    : 'gray.100',
                }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Divider orientation="vertical" h="24px" borderColor="gray.300" />

            {/* Subscript/Superscript */}
            <Tooltip label="Subscript">
              <IconButton
                aria-label="Subscript"
                icon={<Box as={RiSubscript} boxSize={5} />}
                size="sm"
                variant={activeFormats.has('subscript') ? 'solid' : 'ghost'}
                colorScheme={activeFormats.has('subscript') ? 'purple' : 'gray'}
                onClick={() => executeCommand('subscript')}
                _hover={{
                  bg: activeFormats.has('subscript')
                    ? 'purple.600'
                    : 'gray.100',
                }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label="Superscript">
              <IconButton
                aria-label="Superscript"
                icon={<Box as={RiSuperscript} boxSize={5} />}
                size="sm"
                variant={activeFormats.has('superscript') ? 'solid' : 'ghost'}
                colorScheme={
                  activeFormats.has('superscript') ? 'purple' : 'gray'
                }
                onClick={() => executeCommand('superscript')}
                _hover={{
                  bg: activeFormats.has('superscript')
                    ? 'purple.600'
                    : 'gray.100',
                }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Divider orientation="vertical" h="24px" borderColor="gray.300" />

            {/* History Controls */}
            <Tooltip label="Undo (Ctrl+Shift+Z)">
              <IconButton
                aria-label="Undo"
                icon={<RepeatClockIcon />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={handleUndo}
                isDisabled={historyIndex <= 0}
                _hover={{ bg: 'gray.100' }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label="Redo (Ctrl+Shift+Y)">
              <IconButton
                aria-label="Redo"
                icon={<RepeatIcon />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={handleRedo}
                isDisabled={historyIndex >= history.length - 1}
                _hover={{ bg: 'gray.100' }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Divider orientation="vertical" h="24px" borderColor="gray.300" />

            {/* Utility Controls */}
            <Tooltip label="Copy to clipboard">
              <IconButton
                aria-label="Copy"
                icon={<CopyIcon />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={handleCopy}
                _hover={{ bg: 'blue.50' }}
                transition="all 0.2s"
              />
            </Tooltip>

            <Tooltip label="Clear all">
              <IconButton
                aria-label="Clear"
                icon={<Box as={RiDeleteBin6Line} boxSize={5} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleClear}
                _hover={{ bg: 'red.50' }}
                transition="all 0.2s"
              />
            </Tooltip>
          </HStack>
        </Box>

        {/* Rich Text Editor */}
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          className="ipa-text"
          bg="white"
          p={4}
          minH={minHeight}
          maxH={maxHeight}
          overflowY="auto"
          borderBottomRadius="lg"
          border="2px solid"
          borderTop="none"
          borderColor="brand.iris"
          fontSize="lg"
          lineHeight="1.8"
          outline="none"
          _focus={{
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-iris)',
          }}
          _empty={{
            _before: {
              content: `"${placeholder}"`,
              color: 'gray.400',
              fontStyle: 'italic',
            },
          }}
           sx={{
             // Ensure IPA symbols render correctly
             fontFeatureSettings: "'ccmp' 1, 'mark' 1, 'mkmk' 1",
             textRendering: 'optimizeLegibility',
             WebkitFontSmoothing: 'antialiased',
             MozOsxFontSmoothing: 'grayscale',
             '& *': {
               fontFamily:
                 "'Charis SIL', 'Noto Sans', 'Doulos SIL', 'Arial Unicode MS', sans-serif !important",
             },
           }}
         />
      </VStack>
    )
  },
)

RichTextIPAEditor.displayName = 'RichTextIPAEditor'

export default RichTextIPAEditor
