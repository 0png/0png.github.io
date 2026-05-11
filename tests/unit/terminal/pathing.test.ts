import { describe, expect, it } from 'vitest'
import { formatCwd, navHrefForPath, normalizePath } from '@/lib/terminal/pathing'

describe('terminal pathing helpers', () => {
  it('normalizes root aliases and relative paths against cwd', () => {
    expect(normalizePath('', '/projects')).toBe('/')
    expect(normalizePath('~', '/projects')).toBe('/')
    expect(normalizePath('.', '/projects')).toBe('/projects')
    expect(normalizePath('README.md', '/projects/0png-portfolio')).toBe(
      '/projects/0png-portfolio/README.md'
    )
    expect(normalizePath('..', '/projects/0png-portfolio')).toBe('/projects')
    expect(normalizePath('~/contact', '/projects')).toBe('/contact')
  })

  it('keeps parent traversal from escaping below root', () => {
    expect(normalizePath('../..', '/about')).toBe('/')
    expect(normalizePath('../../contact', '/')).toBe('/contact')
  })

  it('maps virtual paths to navigation hrefs', () => {
    expect(navHrefForPath('/')).toBe('/')
    expect(navHrefForPath('/home')).toBe('/')
    expect(navHrefForPath('/about')).toBe('/#about')
    expect(navHrefForPath('/projects')).toBe('/projects')
    expect(navHrefForPath('/projects/0png-portfolio')).toBe('/projects/0png-portfolio')
    expect(navHrefForPath('/changelog')).toBe('/#changelog')
    expect(navHrefForPath('/contact')).toBe('/#contact')
    expect(navHrefForPath('/missing')).toBeNull()
  })

  it('formats cwd for the terminal chrome', () => {
    expect(formatCwd('/')).toBe('~')
    expect(formatCwd('/projects')).toBe('~/projects')
  })
})
