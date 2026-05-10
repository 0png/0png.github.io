import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const page = readFileSync(resolve(root, 'src/pages/projects/[slug].astro'), 'utf-8')
const layout = readFileSync(resolve(root, 'src/layouts/BlogLayout.astro'), 'utf-8')

describe('project devlog dossier layout', () => {
  it('assembles heading, reading-time, and prev/next project data from the slug route', () => {
    expect(page).toContain('const { Content, headings } = await entry.render()')
    expect(page).toContain('readingTimeText')
    expect(page).toContain('canonicalPath')
    expect(page).toContain('prevProject')
    expect(page).toContain('nextProject')
  })

  it('renders dossier affordances in the shared layout', () => {
    expect(layout).toContain('READ TIME')
    expect(layout).toContain('COPY LINK')
    expect(layout).toContain('SECTION INDEX')
    expect(layout).toContain('MISSION BRIEF')
    expect(layout).toContain('PREV FILE')
    expect(layout).toContain('NEXT FILE')
    expect(layout).toContain('data-reading-progress')
    expect(layout).toContain('data-copy-link')
    expect(layout).toContain('data-toc-link')
  })
})
