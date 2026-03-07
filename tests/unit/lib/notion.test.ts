import { describe, it, expect, vi } from 'vitest'

// These tests will FAIL until src/lib/notion.ts is implemented (T029)

// Minimal PageObjectResponse shape for testing
type RichText = { plain_text: string }

interface MockPage {
  id: string
  properties: {
    Title: { type: 'title'; title: RichText[] }
    Slug: { type: 'rich_text'; rich_text: RichText[] }
    Published: { type: 'checkbox'; checkbox: boolean }
    Date: { type: 'date'; date: { start: string } | null }
    ProjectId: { type: 'rich_text'; rich_text: RichText[] }
    Excerpt: { type: 'rich_text'; rich_text: RichText[] }
  }
}

vi.mock('@notionhq/client', () => ({
  Client: vi.fn(() => ({})),
}))

vi.mock('notion-to-md', () => ({
  NotionToMarkdown: vi.fn(() => ({})),
}))

function makeMockPage(overrides: Partial<MockPage['properties']> = {}): MockPage {
  return {
    id: 'page-id-abc123',
    properties: {
      Title: { type: 'title', title: [{ plain_text: 'My Devlog Post' }] },
      Slug: { type: 'rich_text', rich_text: [{ plain_text: 'my-devlog-post' }] },
      Published: { type: 'checkbox', checkbox: true },
      Date: { type: 'date', date: { start: '2026-03-07' } },
      ProjectId: { type: 'rich_text', rich_text: [{ plain_text: '0png-website' }] },
      Excerpt: { type: 'rich_text', rich_text: [{ plain_text: 'A short description.' }] },
      ...overrides,
    },
  }
}

import { transformNotionPage } from '@/lib/notion'

describe('transformNotionPage', () => {
  it('returns a DevlogEntry matching data-model.md shape for a valid published page', () => {
    const page = makeMockPage()
    const result = transformNotionPage(page as never)

    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      id: 'page-id-abc123',
      slug: 'my-devlog-post',
      title: 'My Devlog Post',
      excerpt: 'A short description.',
      date: '2026-03-07',
      projectId: '0png-website',
      published: true,
    })
  })

  it('returns null when Published is false', () => {
    const page = makeMockPage({
      Published: { type: 'checkbox', checkbox: false },
    })
    const result = transformNotionPage(page as never)
    expect(result).toBeNull()
  })

  it('throws when Slug property is missing or empty', () => {
    const page = makeMockPage({
      Slug: { type: 'rich_text', rich_text: [] },
    })
    expect(() => transformNotionPage(page as never)).toThrow()
  })

  it('throws when Title property is missing or empty', () => {
    const page = makeMockPage({
      Title: { type: 'title', title: [] },
    })
    expect(() => transformNotionPage(page as never)).toThrow()
  })

  it('throws when ProjectId property is missing or empty', () => {
    const page = makeMockPage({
      ProjectId: { type: 'rich_text', rich_text: [] },
    })
    expect(() => transformNotionPage(page as never)).toThrow()
  })

  it('includes id as the Notion page ID', () => {
    const page = makeMockPage()
    const result = transformNotionPage(page as never)
    expect(result?.id).toBe('page-id-abc123')
  })

  it('extracts slug from Slug rich_text plain_text', () => {
    const page = makeMockPage({
      Slug: { type: 'rich_text', rich_text: [{ plain_text: 'my-custom-slug' }] },
    })
    const result = transformNotionPage(page as never)
    expect(result?.slug).toBe('my-custom-slug')
  })

  it('extracts date from Date.date.start', () => {
    const page = makeMockPage({
      Date: { type: 'date', date: { start: '2025-12-01' } },
    })
    const result = transformNotionPage(page as never)
    expect(result?.date).toBe('2025-12-01')
  })

  it('extracts projectId from ProjectId rich_text plain_text', () => {
    const page = makeMockPage({
      ProjectId: { type: 'rich_text', rich_text: [{ plain_text: 'my-project' }] },
    })
    const result = transformNotionPage(page as never)
    expect(result?.projectId).toBe('my-project')
  })
})
