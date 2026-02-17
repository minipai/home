import { marked } from 'marked'

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
