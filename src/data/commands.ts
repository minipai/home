import welcomeMd from '../content/welcome.md?raw'
import helpMd from '../content/help.md?raw'
import aboutMd from '../content/about.md?raw'
import skillsMd from '../content/skills.md?raw'
import resumeMd from '../content/resume.md?raw'
import projectsMd from '../content/projects.md?raw'

export interface CommandOutput {
  markdown: string
}

export const commands: Record<string, CommandOutput> = {
  '/help': { markdown: helpMd },
  '/about': { markdown: aboutMd },
  '/skills': { markdown: skillsMd },
  '/resume': { markdown: resumeMd },
  '/projects': { markdown: projectsMd },
  '/reset': { markdown: '' },
}

export const welcomeMarkdown = welcomeMd

export const commandDescriptions: Record<string, string> = {
  '/about': 'Who am I',
  '/skills': 'Technical skills',
  '/resume': 'Work history',
  '/projects': 'Side projects',
  '/reset': 'Clear screen',
  '/help': 'Show available commands',
}
