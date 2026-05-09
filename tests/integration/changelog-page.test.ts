import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const page = readFileSync(resolve(root, 'src/pages/changelog.astro'), 'utf-8')

describe('standalone changelog page redesign', () => {
  it('uses a terminal HUD treatment instead of the old purple vignette timeline', () => {
    expect(page).toContain('changelog-hud')
    expect(page).toContain('hud-scanlines')
    expect(page).toContain('git log --graph --decorate')
    expect(page).toContain('data-spine-progress')
    expect(page).not.toMatch(/purple|violet|rgba\(88,\s*28,\s*135/i)
  })

  it('provides client-side search, type filters, and expand controls', () => {
    expect(page).toContain('data-changelog-search')
    expect(page).toContain('data-filter-chip')
    expect(page).toContain('data-expand-all')
    expect(page).toContain('data-collapse-all')
    expect(page).toContain('applyFilters')
    expect(page).toContain('setBodyExpanded')
  })

  it('keeps controls in normal document flow and scrolls filtered results into view', () => {
    expect(page).toContain('data-controls-panel')
    expect(page).toContain('data-commit-stream')
    expect(page).toContain('scrollToFirstVisibleEntry')
    expect(page).toContain('[data-entry]:not(.is-hidden)')
    expect(page).toContain('requestAnimationFrame')

    const controlsSection = page.slice(
      page.indexOf('data-controls-panel'),
      page.indexOf('data-commit-stream'),
    )

    expect(controlsSection).not.toContain('sticky')
    expect(controlsSection).not.toContain('top-[72px]')
    expect(controlsSection).not.toContain('z-20')
  })

  it('renders commit rows with data attributes for filtering and animation', () => {
    expect(page).toContain('data-entry')
    expect(page).toContain('data-type')
    expect(page).toContain('data-search-text')
    expect(page).toContain('data-body-text')
    expect(page).toContain('data-expanded')
    expect(page).toContain('scrambleHash')
  })
})
