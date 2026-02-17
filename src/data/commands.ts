import welcomeMd from '../content/welcome.md?raw'
import helpMd from '../content/help.md?raw'
import aboutMd from '../content/about.md?raw'
import skillsMd from '../content/skills.md?raw'
import resumeMd from '../content/resume.md?raw'
import projectsMd from '../content/projects.md?raw'

export interface Command {
  markdown: string
  description: string
}

export const commands: Record<string, Command> = {
  '/about': { markdown: aboutMd, description: 'Who am I' },
  '/skills': { markdown: skillsMd, description: 'Technical skills' },
  '/resume': { markdown: resumeMd, description: 'Work history' },
  '/projects': { markdown: projectsMd, description: 'Side projects' },
  '/reset': { markdown: '', description: 'Clear screen' },
  '/help': { markdown: helpMd, description: 'Show available commands' },
}

export const welcomeMarkdown = welcomeMd
