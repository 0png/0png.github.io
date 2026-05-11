import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const page = readFileSync(resolve(root, 'src/pages/projects/index.astro'), 'utf-8')
const hero = readFileSync(resolve(root, 'src/components/projects/ProjectsHero.astro'), 'utf-8')
const card = readFileSync(resolve(root, 'src/components/projects/ProjectStackCard.astro'), 'utf-8')
const atmosphere = readFileSync(resolve(root, 'src/components/projects/ProjectsAtmosphere.astro'), 'utf-8')
const script = readFileSync(resolve(root, 'src/scripts/projects-page.ts'), 'utf-8')

describe('standalone projects page redesign', () => {
  it('renders an immersive 3D stack experience, not the old radar or plain grid shell', () => {
    expect(page).toContain('projects-command-page')
    expect(page).toContain('ProjectsAtmosphere')
    expect(page).toContain('ProjectsHero')
    expect(page).toContain('ProjectStackCard')
    expect(page).toContain('projects-stack-stage')
    expect(atmosphere).toContain('projects-grid-plane')
    expect(card).toContain('project-stack-card')
    expect(card).toContain('project-node-callout')
    expect(page).not.toContain('projects-orbit-map')
    expect(page).not.toContain('mx-auto max-w-7xl px-8 pt-28 pb-24')
  })

  it('keeps compact filters and stronger project count context', () => {
    expect(hero).toContain('data-project-filter')
    expect(card).toContain('data-project-card')
    expect(hero).toContain('All Builds')
    expect(hero).toContain('~/home')
    expect(hero).toContain('ls --depth --interactive ./projects')
    expect(hero).toContain('/usr/local/portfolio.project-stack')
    expect(page).toContain('projectCount={allProjects.length}')
    expect(page).toContain('featuredCount={featuredProjects.length}')
    expect(hero).toContain('data-project-count')
  })

  it('includes exaggerated depth hooks with reduced-motion support', () => {
    expect(hero).toContain('data-projects-reveal')
    expect(card).toContain('data-project-depth')
    expect(card).toContain('data-project-media')
    expect(card).toContain('data-project-callout')
    expect(script).toContain('IntersectionObserver')
    expect(script).toContain('updateProjectsDepth')
    expect(script).toContain('PROJECTS_FOCUS_START')
    expect(script).toContain('PROJECTS_FOCUS_END')
    expect(page).toContain('prefers-reduced-motion: reduce')
  })
})
