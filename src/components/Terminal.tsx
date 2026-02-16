import { useState, useRef, useEffect, useCallback } from 'react'
import { commands, welcomeLines } from '../data/commands'
import TerminalInput, { type TerminalInputHandle } from './TerminalInput'
import styles from './Terminal.module.css'

interface OutputEntry {
  text: string
  type: 'normal' | 'command' | 'error' | 'heading' | 'subtitle' | 'accent'
}

// Detect line semantics for richer styling
function classifyLine(text: string, index: number, allLines: string[]): OutputEntry['type'] {
  const trimmed = text.trim()
  if (!trimmed) return 'normal'

  // Welcome: first non-empty line is the name
  if (index <= 1 && trimmed === 'Art Pai') return 'heading'

  // /help header
  if (trimmed === 'Available Commands') return 'heading'

  // /help command entries (start with /)
  if (/^\/.+\s{2,}/.test(trimmed)) return 'accent'

  // Section headings: short line followed by content, no special chars
  // Heuristic: line with no special prefix, next line exists and is indented content
  const next = allLines[index + 1]?.trim()
  const prev = allLines[index - 1]?.trim()
  if (
    trimmed.length < 60 &&
    !trimmed.includes('·') &&
    !trimmed.includes('—') &&
    !trimmed.includes('@') &&
    !trimmed.includes('(') &&
    prev === '' &&
    next &&
    next !== ''
  ) {
    // Could be a heading for skills/education/projects sections
    const headingPatterns = [
      'Core', 'Build & Tooling', 'Testing', 'Architecture', 'Other', 'Languages',
      'CookDB',
      'MA Environment and Art', 'BS Fiber, Textile and Weaving Arts',
    ]
    if (headingPatterns.includes(trimmed)) return 'heading'
  }

  // Experience: role lines (contain —)
  if (trimmed.includes(' — ') && !trimmed.startsWith('Type')) return 'heading'

  // Subtitle: date ranges, subtitle line
  if (trimmed === 'Senior Front-End Engineer') return 'subtitle'
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}/.test(trimmed)) return 'subtitle'
  if (/^\d{4}\s–/.test(trimmed)) return 'subtitle'

  // Contact labels
  if (/^(Email|Phone|Location)\s{2,}/.test(trimmed)) return 'accent'

  return 'normal'
}

function Terminal() {
  const [history, setHistory] = useState<OutputEntry[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<TerminalInputHandle>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, [])

  const typeLines = useCallback(
    async (lines: string[], forceType?: OutputEntry['type']) => {
      setIsTyping(true)
      for (let i = 0; i < lines.length; i++) {
        const type = forceType ?? classifyLine(lines[i], i, lines)
        await new Promise<void>((resolve) => {
          setHistory((prev) => [...prev, { text: lines[i], type }])
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
    typeLines(welcomeLines)
    inputRef.current?.focus()
  }, [typeLines])

  useEffect(scrollToBottom, [history, scrollToBottom])

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()

    setHistory((prev) => [...prev, { text: `❯ ${cmd}`, type: 'command' }])

    if (trimmed === '/clear') {
      setHistory([])
    }

    const result = commands[trimmed]
    if (result) {
      await typeLines(result.lines)
    } else if (trimmed === '') {
      // do nothing
    } else {
      await typeLines(
        [`  Command not found: ${trimmed}`, '  Type /help for available commands.', ''],
        'error'
      )
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.output}>
        {history.map((entry, i) => (
          <div
            key={i}
            className={`${styles.line} ${styles[entry.type + 'Line'] ?? ''}`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <TerminalInput ref={inputRef} isTyping={isTyping} onCommand={handleCommand} />
    </div>
  )
}

export default Terminal
