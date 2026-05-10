import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const terminalPalette = readFileSync(resolve(root, 'src/components/TerminalPalette.tsx'), 'utf-8')

describe('terminal command palette', () => {
  it('supports Linux-like navigation and inspection commands', () => {
    expect(terminalPalette).toContain("'pwd'")
    expect(terminalPalette).toContain("'tree'")
    expect(terminalPalette).toContain("'find /projects'")
    expect(terminalPalette).toContain("'grep -i astro /projects'")
    expect(terminalPalette).toContain("'xdg-open .'")
    expect(terminalPalette).toContain("'uname -a'")
  })

  it('offers categorized help and manual-style command hints', () => {
    expect(terminalPalette).toContain('HELP_SECTIONS')
    expect(terminalPalette).toContain("'help all'")
    expect(terminalPalette).toContain("'help navigation'")
    expect(terminalPalette).toContain("'help files'")
    expect(terminalPalette).toContain("'help search'")
    expect(terminalPalette).toContain("'help system'")
    expect(terminalPalette).toContain("'man cd'")
    expect(terminalPalette).toContain('helpForCommand')
  })

  it('can navigate directly into project devlog paths', () => {
    expect(terminalPalette).toContain('cd /projects/${project.devlogSlug}')
    expect(terminalPalette).toContain("path.startsWith('/projects/')")
    expect(terminalPalette).toContain("return path")
  })

  it('models the site as a small read-only filesystem', () => {
    expect(terminalPalette).toContain('normalizePath')
    expect(terminalPalette).toContain('listDirectory')
    expect(terminalPalette).toContain('readFile')
    expect(terminalPalette).toContain('/about/about_me.txt')
    expect(terminalPalette).toContain('/projects/${project.devlogSlug ?? project.id}/README.md')
  })
})
