export type LineKind = 'cmd' | 'out' | 'success' | 'info' | 'warn' | 'err' | 'link'

export type Line = {
  id: number
  kind: LineKind
  text: string
  href?: string
}

export type CommandResult = {
  lines: Line[]
  href?: string
  newTab?: string
  cwd?: string
}

export type CommandContext = {
  cwd: string
  history: string[]
  key: string
  display: string
}

export type HelpTopic = 'navigation' | 'files' | 'search' | 'system'

let nextLineId = 0

export const mkLine = (kind: LineKind, text: string, href?: string): Line => ({
  id: nextLineId++,
  kind,
  text,
  href,
})
