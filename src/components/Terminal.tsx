import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react'
import { commands, welcomeLines, commandDescriptions } from '../data/commands'
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
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [cmdIndex, setCmdIndex] = useState(-1)
  const [menuIndex, setMenuIndex] = useState(-1)
  const [selectedCmd, setSelectedCmd] = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  const allCommands = useMemo(() => Object.keys(commandDescriptions), [])
  const suggestions = useMemo(() => {
    if (!input.startsWith('/')) return []
    return allCommands.filter((cmd) => cmd.startsWith(input.toLowerCase()))
  }, [input, allCommands])
  const showMenu = suggestions.length > 0 && input.startsWith('/') && !commands[input.toLowerCase()]

  // Sync menuIndex from selectedCmd, auto-select first if selection is gone
  useEffect(() => {
    if (!showMenu) return
    if (selectedCmd) {
      const idx = suggestions.indexOf(selectedCmd)
      if (idx >= 0) {
        setMenuIndex(idx)
        return
      }
    }
    // No valid selection, pick first
    setMenuIndex(0)
    setSelectedCmd(suggestions[0] ?? null)
  }, [showMenu, suggestions, selectedCmd])

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
    setCmdHistory((prev) => [cmd, ...prev])
    setCmdIndex(-1)
    setInput('')

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

  const selectSuggestion = (cmd: string) => {
    setInput(cmd)
    setMenuIndex(-1)
    setSelectedCmd(null)
    inputRef.current?.focus()
  }

  const navigateMenu = (nextIndex: number) => {
    setMenuIndex(nextIndex)
    setSelectedCmd(suggestions[nextIndex] ?? null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showMenu) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        navigateMenu(menuIndex <= 0 ? suggestions.length - 1 : menuIndex - 1)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        navigateMenu(menuIndex >= suggestions.length - 1 ? 0 : menuIndex + 1)
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const idx = menuIndex >= 0 ? menuIndex : 0
        selectSuggestion(suggestions[idx])
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const idx = menuIndex >= 0 ? menuIndex : 0
        selectSuggestion(suggestions[idx])
        return
      }
      if (e.key === 'Escape') {
        setMenuIndex(-1)
        setInput('')
        return
      }
    }

    if (e.key === 'Enter' && !isTyping) {
      handleCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const next = Math.min(cmdIndex + 1, cmdHistory.length - 1)
        setCmdIndex(next)
        setInput(cmdHistory[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cmdIndex > 0) {
        const next = cmdIndex - 1
        setCmdIndex(next)
        setInput(cmdHistory[next])
      } else {
        setCmdIndex(-1)
        setInput('')
      }
    }
  }

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.output} ref={outputRef}>
        {history.map((entry, i) => (
          <div
            key={i}
            className={`${styles.line} ${styles[entry.type + 'Line'] ?? ''}`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <div className={styles.inputRow}>
        {showMenu && (
          <div className={styles.menu}>
            {suggestions.map((cmd, i) => (
              <div
                key={cmd}
                className={`${styles.menuItem} ${i === menuIndex ? styles.menuItemActive : ''}`}
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(cmd) }}
                onMouseEnter={() => navigateMenu(i)}
              >
                <span className={styles.menuCmd}>{cmd}</span>
                <span className={styles.menuDesc}>{commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        )}
        <span className={styles.prompt}>❯</span>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          autoFocus
          disabled={isTyping}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>
    </div>
  )
}

export default Terminal
