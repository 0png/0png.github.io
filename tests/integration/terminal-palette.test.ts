import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { COMMAND_KEYS, resolveCommand } from '@/lib/terminal/commands'

const root = resolve(__dirname, '../../')
const terminalPaletteWrapper = readFileSync(resolve(root, 'src/components/TerminalPalette.tsx'), 'utf-8')

describe('terminal command palette', () => {
  it('keeps the public component import as a wrapper', () => {
    expect(terminalPaletteWrapper).toContain("export { default } from '@/components/terminal/TerminalPalette'")
  })

  it('supports Linux-like navigation and inspection commands', () => {
    expect(COMMAND_KEYS).toContain('pwd')
    expect(COMMAND_KEYS).toContain('tree')
    expect(COMMAND_KEYS).toContain('find /projects')
    expect(COMMAND_KEYS).toContain('grep -i astro /projects')
    expect(COMMAND_KEYS).toContain('xdg-open .')
    expect(COMMAND_KEYS).toContain('uname -a')
  })

  it('offers categorized help and manual-style command hints', () => {
    expect(COMMAND_KEYS).toContain('help all')
    expect(COMMAND_KEYS).toContain('help navigation')
    expect(COMMAND_KEYS).toContain('help files')
    expect(COMMAND_KEYS).toContain('help search')
    expect(COMMAND_KEYS).toContain('help system')
    expect(COMMAND_KEYS).toContain('man cd')

    const result = resolveCommand({
      cwd: '/',
      history: [],
      key: 'help navigation',
      display: 'help navigation',
    })

    expect(result.lines[0]?.text).toBe('Navigation')
  })

  it('can navigate directly into project devlog paths', () => {
    expect(COMMAND_KEYS.some((command) => command.startsWith('cd /projects/'))).toBe(true)

    const result = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cd /projects/0png-portfolio',
      display: 'cd /projects/0png-portfolio',
    })

    expect(result.cwd).toBe('/projects/0png-portfolio')
    expect(result.href).toBe('/projects/0png-portfolio')
  })

  it('models the site as a small read-only filesystem', () => {
    const readme = resolveCommand({
      cwd: '/projects/0png-portfolio',
      history: [],
      key: 'cat readme.md',
      display: 'cat README.md',
    })

    expect(readme.lines.some((line) => line.text === '/projects/0png-portfolio/README.md')).toBe(true)
    expect(readme.lines.some((line) => line.text === '0PNG Portfolio')).toBe(true)
  })
})
