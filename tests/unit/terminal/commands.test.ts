import { describe, expect, it } from 'vitest'
import { COMMAND_KEYS, resolveCommand } from '@/lib/terminal/commands'

describe('terminal command resolver', () => {
  it('returns categorized help output', () => {
    const help = resolveCommand({
      cwd: '/',
      history: [],
      key: 'help',
      display: 'help',
    })
    const helpAll = resolveCommand({
      cwd: '/',
      history: [],
      key: 'help all',
      display: 'help all',
    })
    const manCd = resolveCommand({
      cwd: '/',
      history: [],
      key: 'man cd',
      display: 'man cd',
    })

    expect(help.lines[0]?.text).toBe('0PNG shell help')
    expect(helpAll.lines.some((line) => line.text === 'All commands')).toBe(true)
    expect(manCd.lines[0]?.text).toBe('Navigation')
  })

  it('lists and navigates project directories', () => {
    const lsProjects = resolveCommand({
      cwd: '/',
      history: [],
      key: 'ls /projects',
      display: 'ls /projects',
    })
    const cdProject = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cd /projects/0png-portfolio',
      display: 'cd /projects/0png-portfolio',
    })

    expect(lsProjects.lines.some((line) => line.text.includes('0png-portfolio/'))).toBe(true)
    expect(cdProject.cwd).toBe('/projects/0png-portfolio')
    expect(cdProject.href).toBe('/projects/0png-portfolio')
  })

  it('reads virtual files and searches project metadata', () => {
    const about = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cat /about/about_me.txt',
      display: 'cat /about/about_me.txt',
    })
    const grep = resolveCommand({
      cwd: '/',
      history: [],
      key: 'grep -i astro /projects',
      display: 'grep -i astro /projects',
    })

    expect(about.lines[0]?.text).toBe('/about/about_me.txt')
    expect(about.lines.some((line) => line.text.includes('0PNG -'))).toBe(true)
    expect(grep.lines.some((line) => line.text.includes('/projects/0png-portfolio:'))).toBe(true)
  })

  it('routes changelog navigation to the standalone page and prints commit excerpts', () => {
    const changelogNav = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cd /changelog',
      display: 'cd /changelog',
    })
    const changelogLog = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cat /changelog/commits.log',
      display: 'cat /changelog/commits.log',
    })

    expect(changelogNav.href).toBe('/changelog')
    expect(changelogNav.cwd).toBe('/changelog')
    expect(changelogLog.lines[0]?.text).toBe('/changelog/commits.log')
    expect(changelogLog.lines.some((line) => line.text.includes('feat: redesign changelog surfaces'))).toBe(true)
    expect(changelogLog.lines.some((line) => line.text.includes('Open /changelog for the full terminal-style commit feed.'))).toBe(true)
  })

  it('returns open targets without triggering side effects', () => {
    const openCurrent = resolveCommand({
      cwd: '/projects',
      history: [],
      key: 'xdg-open .',
      display: 'xdg-open .',
    })
    const openGithub = resolveCommand({
      cwd: '/',
      history: [],
      key: 'xdg-open github',
      display: 'xdg-open github',
    })

    expect(openCurrent.href).toBe('/projects')
    expect(openCurrent.cwd).toBe('/projects')
    expect(openGithub.newTab).toBe('https://github.com/0png')
  })

  it('handles command errors and caller-side clear contract', () => {
    const missingCd = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cd /missing',
      display: 'cd /missing',
    })
    const missingPattern = resolveCommand({
      cwd: '/',
      history: [],
      key: 'grep',
      display: 'grep',
    })
    const unsupportedTarget = resolveCommand({
      cwd: '/',
      history: [],
      key: 'grep -i astro /about',
      display: 'grep -i astro /about',
    })
    const catDirectory = resolveCommand({
      cwd: '/',
      history: [],
      key: 'cat /projects',
      display: 'cat /projects',
    })

    expect(COMMAND_KEYS).toContain('clear')
    expect(missingCd.lines[0]?.text).toBe('cd: no such file or directory: /missing')
    expect(missingPattern.lines[0]?.text).toBe('grep: missing search pattern')
    expect(unsupportedTarget.lines[0]?.text).toBe('grep: supported target is /projects')
    expect(catDirectory.lines[0]?.text).toBe('cat: /projects: Is a directory')
  })
})
