import { useState, useRef, useEffect, useCallback } from 'react'
import { commands, welcomeMarkdown } from '../data/commands'
import TerminalInput, { type TerminalInputHandle } from './TerminalInput'
import MarkdownBlock from './MarkdownBlock'
import { parseMarkdownBlocks } from '../utils/markdown'
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

  const typeEntries = useCallback(
    async (entries: OutputEntry[]) => {
      setIsTyping(true)
      for (const entry of entries) {
        await new Promise<void>((resolve) => {
          setHistory((prev) => [...prev, entry])
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

  const typeBlocks = useCallback(
    (markdown: string) =>
      typeEntries(parseMarkdownBlocks(markdown).map((block) => ({ mode: 'html', content: block }))),
    [typeEntries]
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
      { mode: 'text', content: `❯ ${cmd}`, type: 'command' },
    ])

    if (trimmed === '/reset') {
      setHistory([])
      await typeBlocks(welcomeMarkdown)
      setTimeout(() => inputRef.current?.focus(), 50)
      return
    }

    const result = commands[trimmed]
    if (result) {
      await typeBlocks(result.markdown)
    } else if (trimmed === '') {
      // do nothing
    } else {
      await typeEntries([
        { mode: 'text', content: `Command not found: ${trimmed}`, type: 'error' },
        { mode: 'text', content: 'Type /help for available commands.', type: 'error' },
      ])
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className={styles.terminal} onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus()
      }}>
      <div className={styles.output}>
        {history.map((entry, i) =>
          entry.mode === 'html' ? (
            <MarkdownBlock key={i} html={entry.content} onCommand={handleCommand} />
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
