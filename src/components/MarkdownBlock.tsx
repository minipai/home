import { useMemo } from 'react'
import { marked } from 'marked'
import styles from './MarkdownBlock.module.css'

marked.setOptions({ breaks: true })

function splitHtmlBlocks(html: string): string[] {
  const container = document.createElement('div')
  container.innerHTML = html
  const blocks: string[] = []
  for (const child of container.childNodes) {
    if (child instanceof HTMLElement) {
      blocks.push(child.outerHTML)
    } else if (child.textContent?.trim()) {
      blocks.push(child.textContent)
    }
  }
  return blocks
}

export function parseMarkdownBlocks(markdown: string): string[] {
  const html = marked.parse(markdown) as string
  return splitHtmlBlocks(html)
}

function MarkdownBlock({ html }: { html: string }) {
  const content = useMemo(() => ({ __html: html }), [html])
  return <div className={styles.root} dangerouslySetInnerHTML={content} />
}

export default MarkdownBlock
