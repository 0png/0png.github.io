import { describe, expect, it } from 'vitest'
import { projects } from '@/data/projects'
import {
  getProjectsPageData,
  matchesProjectFilter,
  PROJECTS_FOCUS_END,
  PROJECTS_FOCUS_START,
  PROJECTS_MOBILE_BREAKPOINT,
} from '@/lib/projects-page'

describe('projects page helpers', () => {
  it('derives sorted projects, featured count, tags, and latest year', () => {
    const data = getProjectsPageData(projects)

    expect(data.allProjects.map((project) => project.order)).toEqual([1, 2, 3, 4, 5])
    expect(data.featuredProjects).toHaveLength(5)
    expect(data.allTags).toEqual([
      'Astro',
      'CSS',
      'Electron',
      'GSAP',
      'HTML',
      'Ink',
      'JavaScript',
      'Node.js',
      'PWA',
      'React',
      'Tailwind',
      'TypeScript',
    ])
    expect(data.latestYear).toBe(2026)
  })

  it('matches project filters without changing current semantics', () => {
    expect(matchesProjectFilter(['Astro', 'TypeScript'], 'all')).toBe(true)
    expect(matchesProjectFilter(['Astro', 'TypeScript'], 'Astro')).toBe(true)
    expect(matchesProjectFilter(['Astro', 'TypeScript'], 'Electron')).toBe(false)
  })

  it('exports the current interactive thresholds as shared constants', () => {
    expect(PROJECTS_MOBILE_BREAKPOINT).toBe(980)
    expect(PROJECTS_FOCUS_START).toBe(0.28)
    expect(PROJECTS_FOCUS_END).toBe(0.72)
  })
})
