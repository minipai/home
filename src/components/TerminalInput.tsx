import { useState, useRef, useMemo, useImperativeHandle, forwardRef, type KeyboardEvent } from 'react'
import { commands, commandDescriptions } from '../data/commands'
import styles from './TerminalInput.module.css'

interface TerminalInputProps {
  isTyping: boolean
  onCommand: (cmd: string) => void
}

export interface TerminalInputHandle {
  focus: () => void
}

const TerminalInput = forwardRef<TerminalInputHandle, TerminalInputProps>(
  ({ isTyping, onCommand }, ref) => {
    const [input, setInput] = useState('')
    const [cmdHistory, setCmdHistory] = useState<string[]>([])
    const [cmdIndex, setCmdIndex] = useState(-1)
    const [selectedCmd, setSelectedCmd] = useState<string | null>(null)
    const [menuDismissed, setMenuDismissed] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }))

    const allCommands = useMemo(() => Object.keys(commandDescriptions), [])
    const suggestions = useMemo(() => {
      if (!input.startsWith('/')) return []
      return allCommands.filter((cmd) => cmd.startsWith(input.toLowerCase()))
    }, [input, allCommands])
    const showMenu = suggestions.length > 0 && input.startsWith('/') && !commands[input.toLowerCase()] && !menuDismissed

    const menuIndex = useMemo(() => {
      if (!showMenu) return -1
      if (selectedCmd) {
        const idx = suggestions.indexOf(selectedCmd)
        if (idx >= 0) return idx
      }
      return 0
    }, [showMenu, suggestions, selectedCmd])

    const selectSuggestion = (cmd: string) => {
      setInput(cmd)
      setSelectedCmd(null)
      inputRef.current?.focus()
    }

    const navigateMenu = (nextIndex: number) => {
      setSelectedCmd(suggestions[nextIndex] ?? null)
    }

    const handleCommand = (cmd: string) => {
      setCmdHistory((prev) => [cmd, ...prev])
      setCmdIndex(-1)
      setInput('')
      onCommand(cmd)
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
          setSelectedCmd(null)
          setMenuDismissed(true)
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
          onChange={(e) => { setInput(e.target.value); setMenuDismissed(false) }}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          autoFocus
          disabled={isTyping}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>
    )
  }
)

export default TerminalInput
