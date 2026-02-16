import { useState, useRef, useEffect, useCallback } from 'react'
import { commands, welcomeMarkdown } from '../data/commands'
import TerminalInput, { type TerminalInputHandle } from './TerminalInput'
import MarkdownBlock, { parseMarkdownBlocks } from './MarkdownBlock'
import styles from './Terminal.module.css'

type TextType = 'command' | 'error'

type OutputEntry =
  | { mode: 'html'; content: string }
  | { mode: 'text'; content: string; type?: TextType }

function Terminal() {
  const [history, setHistory] = useState<OutputEntry[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<TerminalInputHandle>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, [])

  const typeBlocks = useCallback(
    async (markdown: string) => {
      setIsTyping(true)
      const blocks = parseMarkdownBlocks(markdown)
      for (const block of blocks) {
        await new Promise<void>((resolve) => {
          setHistory((prev) => [...prev, { mode: 'html', content: block }])
          setTimeout(() => {
            scrollToBottom()
            resolve()
          }, 25)
        })
      }
      setIsTyping(false)
      scrollToBottom()
    },
    [scrollToBottom]
  )

  const typeTextLines = useCallback(
    async (lines: string[], type?: TextType) => {
      setIsTyping(true)
      for (const line of lines) {
        await new Promise<void>((resolve) => {
          setHistory((prev) => [...prev, { mode: 'text', content: line, type }])
          setTimeout(() => {
            scrollToBottom()
            resolve()
          }, 25)
        })
      }
      setIsTyping(false)
      scrollToBottom()
    },
    [scrollToBottom]
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    requestAnimationFrame(() => {
      typeBlocks(welcomeMarkdown)
      inputRef.current?.focus()
    })
  }, [typeBlocks])

  useEffect(scrollToBottom, [history, scrollToBottom])

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()

    setHistory((prev) => [
      ...prev,
      { mode: 'text', content: `❯ ${cmd}`, type: 'command' as const },
    ])

    if (trimmed === '/clear') {
      setHistory([])
      setTimeout(() => inputRef.current?.focus(), 50)
      return
    }

    const result = commands[trimmed]
    if (result) {
      await typeBlocks(result.markdown)
    } else if (trimmed === '') {
      // do nothing
    } else {
      await typeTextLines(
        [`Command not found: ${trimmed}`, 'Type /help for available commands.'],
        'error'
      )
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.output}>
        {history.map((entry, i) =>
          entry.mode === 'html' ? (
            <MarkdownBlock key={i} html={entry.content} />
          ) : (
            <div
              key={i}
              className={`${styles.line} ${entry.type ? styles[entry.type] : ''}`}
            >
              {entry.content}
            </div>
          )
        )}
      </div>
      <TerminalInput ref={inputRef} isTyping={isTyping} onCommand={handleCommand} />
    </div>
  )
}

export default Terminal
