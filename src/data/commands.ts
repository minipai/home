import welcomeMd from '../content/welcome.md?raw'
import helpMd from '../content/help.md?raw'
import aboutMd from '../content/about.md?raw'
import skillsMd from '../content/skills.md?raw'
import experienceMd from '../content/experience.md?raw'
import projectsMd from '../content/projects.md?raw'
import educationMd from '../content/education.md?raw'

export interface CommandOutput {
  markdown: string
}

export const commands: Record<string, CommandOutput> = {
  '/help': { markdown: helpMd },
  '/about': { markdown: aboutMd },
  '/skills': { markdown: skillsMd },
  '/experience': { markdown: experienceMd },
  '/projects': { markdown: projectsMd },
  '/education': { markdown: educationMd },
  '/clear': { markdown: '' },
}

export const welcomeMarkdown = welcomeMd

export const commandDescriptions: Record<string, string> = {
  '/about': 'Who am I',
  '/skills': 'Technical skills',
  '/experience': 'Work history',
  '/projects': 'Side projects',
  '/education': 'Education background',
  '/clear': 'Clear screen',
  '/help': 'Show available commands',
}
