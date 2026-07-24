import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
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
import { shouldSuppressMacOptionDeadKeyBeforeInput } from './ipaKeyboardPlatform'

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

type IpaHistoryEntry = { html: string; selStart: number; selEnd: number }

/** Length of `Range.toString()` over root — matches line breaks for &lt;br&gt; in contenteditable */
const getTotalStringMetricLength = (root: HTMLElement): number => {
  const r = document.createRange()
  r.selectNodeContents(root)
  return r.toString().length
}

const boundaryToStringOffset = (
  root: HTMLElement,
  container: Node,
  offset: number,
): number => {
  const r = document.createRange()
  r.selectNodeContents(root)
  r.setEnd(container, offset)
  return r.toString().length
}

const getSelectionOffsets = (
  root: HTMLElement,
): { selStart: number; selEnd: number } => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    const len = getTotalStringMetricLength(root)
    return { selStart: len, selEnd: len }
  }
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) {
    const len = getTotalStringMetricLength(root)
    return { selStart: len, selEnd: len }
  }
  const selStart = boundaryToStringOffset(
    root,
    range.startContainer,
    range.startOffset,
  )
  const selEnd = boundaryToStringOffset(
    root,
    range.endContainer,
    range.endOffset,
  )
  return selStart <= selEnd
    ? { selStart, selEnd }
    : { selStart: selEnd, selEnd: selStart }
}

/** Inverse of boundaryToStringOffset — same walk order as Range.toString() (text + BR as one char) */
const findBoundaryAtOffset = (
  root: HTMLElement,
  target: number,
): [Node, number] => {
  const max = getTotalStringMetricLength(root)
  const t = Math.max(0, Math.min(target, max))
  let pos = 0

  const walk = (parent: Node): [Node, number] | null => {
    for (let i = 0; i < parent.childNodes.length; i++) {
      const child = parent.childNodes[i]
      if (child.nodeType === Node.TEXT_NODE) {
        const len = child.textContent?.length ?? 0
        if (t <= pos + len) {
          return [child, t - pos]
        }
        pos += len
      } else if (child.nodeName === 'BR') {
        if (t <= pos) {
          return [parent, i]
        }
        if (t <= pos + 1) {
          return [parent, i + 1]
        }
        pos += 1
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const inner = walk(child)
        if (inner) return inner
      }
    }
    return null
  }

  const found = walk(root)
  if (found) return found
  return [root, root.childNodes.length]
}

const setSelectionOffsets = (
  root: HTMLElement,
  selStart: number,
  selEnd: number,
): void => {
  const max = getTotalStringMetricLength(root)
  const s = Math.max(0, Math.min(selStart, max))
  const e = Math.max(0, Math.min(selEnd, max))
  const startP = findBoundaryAtOffset(root, s)
  const endP = findBoundaryAtOffset(root, e)
  const range = document.createRange()
  range.setStart(startP[0], startP[1])
  range.setEnd(endP[0], endP[1])
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

export const RichTextIPAEditor = forwardRef<any, RichTextIPAEditorProps>(
  (
    {
      onSymbolInsert,
      onClear,
      placeholder = 'Type or click symbols to create IPA transcription...',
      minHeight = '120px',
      maxHeight = '280px',
    },
    ref,
  ) => {
    const STORAGE_KEY = 'ipa-richtext-content'
    const editorRef = useRef<HTMLDivElement>(null)
    /** True while our own execCommand insert runs — dead-key suppression must never eat it */
    const ownInsertRef = useRef(false)
    /** Skip history snapshots from synthetic input while we batch delete+insert (T9) */
    const suppressHistoryUntilRef = useRef(0)
    /** Undo/redo/load/clear set innerHTML — that fires `input`; must not append history (causes runaway updates). */
    const isApplyingHistoryRef = useRef(false)
    const historyRef = useRef<IpaHistoryEntry[]>([
      { html: '', selStart: 0, selEnd: 0 },
    ])
    const historyIndexRef = useRef(0)
    const [activeFormats, setActiveFormats] = useState<Set<FormatCommand>>(
      new Set(),
    )
    const [history, setHistory] = useState<IpaHistoryEntry[]>([
      { html: '', selStart: 0, selEnd: 0 },
    ])
    const [historyIndex, setHistoryIndex] = useState(0)
    const toast = useToast()

    const shortcutLabels = useMemo(() => {
      const apple =
        typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPod|iPad/i.test(navigator.platform ?? '')
      return {
        bold: apple ? '⌘B' : 'Ctrl+B',
        italic: apple ? '⌘I' : 'Ctrl+I',
        underline: apple ? '⌘U' : 'Ctrl+U',
        undo: apple ? '⌘Z' : 'Ctrl+Z',
        redo: apple ? '⌘⇧Z' : 'Ctrl+Y or Ctrl+Shift+Z',
      }
    }, [])

    useEffect(() => {
      historyRef.current = history
    }, [history])

    useEffect(() => {
      historyIndexRef.current = historyIndex
    }, [historyIndex])

    // Load saved content from localStorage on mount
    useEffect(() => {
      if (typeof window !== 'undefined' && editorRef.current) {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          isApplyingHistoryRef.current = true
          editorRef.current.innerHTML = saved
          const len = getTotalStringMetricLength(editorRef.current)
          const entry: IpaHistoryEntry = {
            html: saved,
            selStart: len,
            selEnd: len,
          }
          setHistory([entry])
          historyRef.current = [entry]
          setHistoryIndex(0)
          historyIndexRef.current = 0
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (editorRef.current) {
                setSelectionOffsets(editorRef.current, len, len)
              }
              isApplyingHistoryRef.current = false
            })
          })
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

      setActiveFormats((prev) => {
        if (prev.size !== formats.size) return formats
        const nextArr = Array.from(formats)
        const prevArr = Array.from(prev)
        for (let i = 0; i < nextArr.length; i += 1) {
          if (!prev.has(nextArr[i])) return formats
        }
        for (let i = 0; i < prevArr.length; i += 1) {
          if (!formats.has(prevArr[i])) return formats
        }
        return prev
      })
    }, [])

    const saveToHistory = useCallback(() => {
      if (!editorRef.current) return

      const content = editorRef.current.innerHTML
      const { selStart, selEnd } = getSelectionOffsets(editorRef.current)
      const idx = historyIndexRef.current
      const prev = historyRef.current
      const currentAtIdx = prev[idx]
      if (
        currentAtIdx &&
        currentAtIdx.html === content &&
        currentAtIdx.selStart === selStart &&
        currentAtIdx.selEnd === selEnd
      ) {
        return
      }
      const truncated = prev.slice(0, idx + 1)
      let next: IpaHistoryEntry[] = [
        ...truncated,
        { html: content, selStart, selEnd },
      ]
      if (next.length > 50) {
        next = next.slice(-50)
      }
      const newIdx = next.length - 1
      historyRef.current = next
      historyIndexRef.current = newIdx
      setHistory(next)
      setHistoryIndex(newIdx)
    }, [])

    const handleUndo = useCallback(() => {
      const hist = historyRef.current
      const idx = historyIndexRef.current
      if (idx <= 0) return
      const newIndex = idx - 1
      const entry = hist[newIndex]
      if (!editorRef.current) return
      isApplyingHistoryRef.current = true
      editorRef.current.innerHTML = entry.html
      setHistoryIndex(newIndex)
      historyIndexRef.current = newIndex
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!editorRef.current) return
          editorRef.current.focus()
          setSelectionOffsets(editorRef.current, entry.selStart, entry.selEnd)
          isApplyingHistoryRef.current = false
        })
      })
    }, [])

    const handleRedo = useCallback(() => {
      const hist = historyRef.current
      const idx = historyIndexRef.current
      if (idx >= hist.length - 1) return
      const newIndex = idx + 1
      const entry = hist[newIndex]
      if (!editorRef.current) return
      isApplyingHistoryRef.current = true
      editorRef.current.innerHTML = entry.html
      setHistoryIndex(newIndex)
      historyIndexRef.current = newIndex
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!editorRef.current) return
          editorRef.current.focus()
          setSelectionOffsets(editorRef.current, entry.selStart, entry.selEnd)
          isApplyingHistoryRef.current = false
        })
      })
    }, [])

    // Clear content
    const handleClear = useCallback(() => {
      if (editorRef.current) {
        isApplyingHistoryRef.current = true
        editorRef.current.innerHTML = ''
        saveToHistory()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isApplyingHistoryRef.current = false
          })
        })
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
        }
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

    const handleInput = useCallback(() => {
      updateActiveFormats()
      if (isApplyingHistoryRef.current) return
      if (Date.now() < suppressHistoryUntilRef.current) return
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isApplyingHistoryRef.current) return
          if (Date.now() < suppressHistoryUntilRef.current) return
          saveToHistory()
        })
      })
    }, [updateActiveFormats, saveToHistory])

    const insertSymbolFallback = (
      editor: HTMLDivElement,
      symbol: string,
      shouldReplace: boolean,
    ) => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (shouldReplace && range.collapsed) {
          document.execCommand('delete', false, undefined)
        } else if (!shouldReplace) {
          range.deleteContents()
        }
        const textNode = document.createTextNode(symbol)
        range.insertNode(textNode)
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        editor.appendChild(document.createTextNode(symbol))
      }
    }

    /** After execCommand('delete'), insertText failed — do not call deleteContents() again */
    const insertSymbolAtCaretOnly = (
      editor: HTMLDivElement,
      symbol: string,
    ) => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const textNode = document.createTextNode(symbol)
        range.insertNode(textNode)
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        editor.appendChild(document.createTextNode(symbol))
      }
    }

    // insertText keeps combining marks (e.g. U+031A) attached to base letters correctly
    const insertSymbol = useCallback(
      (symbol: string, shouldReplace: boolean = false) => {
        const editor = editorRef.current
        if (!editor) return

        editor.focus()

        // If the selection isn't inside the editor (never focused, or the
        // browser dropped it on blur), the insert would land at the start of
        // the content — put the caret at the end instead.
        const sel = window.getSelection()
        if (
          !sel ||
          sel.rangeCount === 0 ||
          !editor.contains(sel.getRangeAt(0).commonAncestorContainer)
        ) {
          const len = getTotalStringMetricLength(editor)
          setSelectionOffsets(editor, len, len)
        }

        if (shouldReplace) {
          suppressHistoryUntilRef.current = Date.now() + 120
          document.execCommand('delete', false, undefined)
        }

        let ok = false
        ownInsertRef.current = true
        try {
          ok = document.execCommand('insertText', false, symbol)
        } catch {
          ok = false
        } finally {
          ownInsertRef.current = false
        }

        if (!ok) {
          if (shouldReplace) {
            suppressHistoryUntilRef.current = Date.now() + 120
            insertSymbolAtCaretOnly(editor, symbol)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                saveToHistory()
                suppressHistoryUntilRef.current = 0
              })
            })
          } else {
            suppressHistoryUntilRef.current = 0
            insertSymbolFallback(editor, symbol, false)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => saveToHistory())
            })
          }
        } else if (shouldReplace) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              saveToHistory()
              suppressHistoryUntilRef.current = 0
            })
          })
        }

        if (onSymbolInsert) {
          onSymbolInsert(symbol)
        }
      },
      [onSymbolInsert, saveToHistory],
    )

    // Cmd/Ctrl for formatting + undo/redo; IPA shortcuts use Option/Alt (handled on window in IPAKeyboard)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement !== editorRef.current) return

        const mod = e.metaKey || e.ctrlKey
        if (!mod) return

        const key = e.key.toLowerCase()

        // Cmd/Ctrl+Shift+Z = redo (macOS standard); Ctrl+Y = redo (Windows)
        if (e.shiftKey && key === 'z') {
          e.preventDefault()
          e.stopPropagation()
          handleRedo()
          return
        }

        // Let Cmd/Ctrl+Shift+letter through for typing capitals (e.g. US layouts)
        if (e.shiftKey && e.key.length === 1 && /[a-z]/i.test(e.key)) {
          return
        }

        if (e.shiftKey) return

        if (key === 'z') {
          e.preventDefault()
          e.stopPropagation()
          handleUndo()
          return
        }

        if (key === 'y' && e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
          handleRedo()
          return
        }

        switch (key) {
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
          default:
            break
        }
      }

      const editor = editorRef.current
      if (editor) {
        editor.addEventListener('keydown', handleKeyDown)
        return () => editor.removeEventListener('keydown', handleKeyDown)
      }
    }, [executeCommand, handleRedo, handleUndo])

    // Route browser Edit → Undo/Redo to our history stack
    useEffect(() => {
      const editor = editorRef.current
      if (!editor) return

      const onBeforeInput = (e: Event) => {
        const ie = e as InputEvent
        if (ie.inputType === 'historyUndo') {
          e.preventDefault()
          handleUndo()
        } else if (ie.inputType === 'historyRedo') {
          e.preventDefault()
          handleRedo()
        }
      }

      editor.addEventListener('beforeinput', onBeforeInput, true)
      return () => {
        editor.removeEventListener('beforeinput', onBeforeInput, true)
      }
    }, [handleRedo, handleUndo])

    // Mac Option+letter dead keys (E/U/I/N) can leak their accent (¨ ´ ˆ ˜)
    // into the editor even though the IPA shortcut already handled the key —
    // the browser commits the pending composition right after, and keydown
    // preventDefault can't stop it. Drop those stray commits while the
    // platform-level suppression window is armed.
    useEffect(() => {
      const editor = editorRef.current
      if (!editor) return

      const onBeforeInputSuppress = (e: Event) => {
        if (ownInsertRef.current) return // our execCommand insert — keep it
        const ie = e as InputEvent
        if (
          shouldSuppressMacOptionDeadKeyBeforeInput(
            ie.inputType,
            ie.data ?? null,
          )
        ) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      // insertCompositionText isn't cancelable, so the accent can still land —
      // remove it right after the composition commits.
      const onCompositionEnd = (e: CompositionEvent) => {
        const data = e.data
        if (!data) return
        if (!shouldSuppressMacOptionDeadKeyBeforeInput('insertText', data)) {
          return
        }
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const r = sel.getRangeAt(0)
        if (!editor.contains(r.startContainer)) return
        if (
          r.startContainer.nodeType === Node.TEXT_NODE &&
          r.startOffset >= data.length
        ) {
          const del = document.createRange()
          del.setStart(r.startContainer, r.startOffset - data.length)
          del.setEnd(r.startContainer, r.startOffset)
          if (del.toString() === data) {
            del.deleteContents()
            requestAnimationFrame(() => saveToHistory())
          }
        }
      }

      editor.addEventListener('beforeinput', onBeforeInputSuppress, true)
      editor.addEventListener('compositionend', onCompositionEnd)
      return () => {
        editor.removeEventListener('beforeinput', onBeforeInputSuppress, true)
        editor.removeEventListener('compositionend', onCompositionEnd)
      }
    }, [saveToHistory])

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
          px={2}
          py={1}
          borderTopRadius="lg"
        >
          <HStack spacing={1} wrap="wrap">
            {/* Text Formatting */}
            <Tooltip label={`Bold (${shortcutLabels.bold})`}>
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

            <Tooltip label={`Italic (${shortcutLabels.italic})`}>
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

            <Tooltip label={`Underline (${shortcutLabels.underline})`}>
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
            <Tooltip label={`Undo (${shortcutLabels.undo})`}>
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

            <Tooltip label={`Redo (${shortcutLabels.redo})`}>
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
          p={2.5}
          minH={minHeight}
          maxH={maxHeight}
          overflowY="auto"
          borderBottomRadius="lg"
          border="2px solid"
          borderTop="none"
          borderColor="brand.iris"
          fontSize="lg"
          lineHeight="1.6"
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
            fontFeatureSettings: "'ccmp' 1, 'mark' 1, 'mkmk' 1",
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            '& *': {
              fontFamily:
                "'Arimo', 'Charis SIL', 'Noto Sans', 'Doulos SIL', 'Arial Unicode MS', sans-serif !important",
            },
          }}
        />
      </VStack>
    )
  },
)

RichTextIPAEditor.displayName = 'RichTextIPAEditor'

export default RichTextIPAEditor
