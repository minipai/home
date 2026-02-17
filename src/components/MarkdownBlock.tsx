import { useCallback, useMemo, type MouseEvent } from 'react'
import styles from './MarkdownBlock.module.css'

interface MarkdownBlockProps {
  html: string
  onCommand?: (cmd: string) => void
}

function MarkdownBlock({ html, onCommand }: MarkdownBlockProps) {
  const content = useMemo(() => ({ __html: html }), [html])

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/"]')
      if (anchor && onCommand) {
        e.preventDefault()
        e.stopPropagation()
        onCommand(anchor.getAttribute('href')!)
      }
    },
    [onCommand]
  )

  return (
    <div
      className={styles.root}
      dangerouslySetInnerHTML={content}
      onClick={handleClick}
    />
  )
}

export default MarkdownBlock
