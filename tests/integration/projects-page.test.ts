import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const page = readFileSync(resolve(root, 'src/pages/projects/index.astro'), 'utf-8')

describe('standalone projects page redesign', () => {
  it('renders an immersive 3D stack experience, not the old radar or plain grid shell', () => {
    expect(page).toContain('projects-command-page')
    expect(page).toContain('projects-hero-stage')
    expect(page).toContain('projects-stack-stage')
    expect(page).toContain('project-stack-card')
    expect(page).toContain('project-node-callout')
    expect(page).not.toContain('projects-orbit-map')
    expect(page).not.toContain('mx-auto max-w-7xl px-8 pt-28 pb-24')
  })

  it('keeps compact filters and stronger project count context', () => {
    expect(page).toContain('data-project-filter')
    expect(page).toContain('data-project-card')
    expect(page).toContain('All Builds')
    expect(page).toContain('~/home')
    expect(page).toContain('ls --depth --interactive ./projects')
    expect(page).toContain('/usr/local/portfolio.project-stack')
    expect(page).toContain('{allProjects.length}')
    expect(page).toContain('{featuredProjects.length}')
    expect(page).toContain('data-project-count')
  })

  it('includes exaggerated depth hooks with reduced-motion support', () => {
    expect(page).toContain('data-projects-reveal')
    expect(page).toContain('data-project-depth')
    expect(page).toContain('data-project-media')
    expect(page).toContain('data-project-callout')
    expect(page).toContain('IntersectionObserver')
    expect(page).toContain('updateProjectsDepth')
    expect(page).toContain('focusStart')
    expect(page).toContain('focusEnd')
    expect(page).toContain('prefers-reduced-motion: reduce')
  })
})
