import { marked } from 'marked'

const renderer = new marked.Renderer()
const defaultLinkRenderer = renderer.link.bind(renderer)
renderer.link = function (token) {
  const html = defaultLinkRenderer(token)
  if (token.href.startsWith('/')) return html
  return html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
}

marked.setOptions({ breaks: true, renderer })

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
