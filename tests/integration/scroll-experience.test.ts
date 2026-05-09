import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const baseLayout = readFileSync(resolve(root, 'src/layouts/BaseLayout.astro'), 'utf-8')
const hero = readFileSync(resolve(root, 'src/components/Hero.astro'), 'utf-8')
const navbar = readFileSync(resolve(root, 'src/components/Navbar.astro'), 'utf-8')
const projects = readFileSync(resolve(root, 'src/components/ProjectsSection.astro'), 'utf-8')
const changelog = readFileSync(resolve(root, 'src/components/ChangelogSection.astro'), 'utf-8')
const globalCss = readFileSync(resolve(root, 'src/styles/global.css'), 'utf-8')

describe('scroll experience upgrade', () => {
  it('mounts a terminal boot overlay that dispatches site-ready', () => {
    expect(baseLayout).toContain('id="site-boot"')
    expect(baseLayout).toContain('terminal-palette')
    expect(baseLayout).toContain('bg-neutral-950')
    expect(baseLayout).toContain("new Event('site-ready')")
  })

  it('keeps the boot overlay aligned with the existing dark terminal palette', () => {
    const bootCss = baseLayout.slice(
      baseLayout.indexOf('#site-boot'),
      baseLayout.indexOf('#mobile-notice'),
    )

    expect(bootCss).not.toContain('34, 197, 94')
    expect(bootCss).not.toContain('56, 189, 248')
    expect(bootCss).toContain('rgba(255, 255, 255')
  })

  it('delays navbar and hero entrance until site-ready', () => {
    expect(navbar).toContain('site-ready')
    expect(hero).toContain('site-ready')
  })

  it('uses pinned scroll scenes for hero and desktop projects', () => {
    expect(hero).toMatch(/pin:\s*true/)
    expect(projects).toContain('matchMedia')
    expect(projects).toMatch(/pin:\s*true/)
    expect(projects).toContain('xPercent')
  })

  it('renders the homepage changelog as an animated terminal feed', () => {
    expect(changelog).toContain('changelog-terminal')
    expect(changelog).toContain('changelog-feed')
    expect(changelog).toContain('changelog-scanline')
    expect(changelog).not.toContain('rgba(88,28,135')
    expect(changelog).toContain('scrambleHash')
    expect(changelog).toContain('open /changelog')
  })

  it('prevents document-level horizontal scrolling from wide pinned scenes', () => {
    expect(globalCss).toMatch(/overflow-x:\s*(clip|hidden)/)
  })
})
