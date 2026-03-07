import { describe, it, expect, vi, beforeEach } from 'vitest'

// These tests will FAIL until src/lib/notion.ts is implemented (T029)

const mocks = vi.hoisted(() => {
  const mockDatabasesQuery = vi.fn()
  return { mockDatabasesQuery }
})

vi.mock('@notionhq/client', () => ({
  Client: vi.fn(() => ({
    databases: {
      query: mocks.mockDatabasesQuery,
    },
  })),
}))

vi.mock('notion-to-md', () => ({
  NotionToMarkdown: vi.fn(() => ({
    pageToMarkdown: vi.fn(),
    toMarkdownString: vi.fn(),
  })),
}))

import { getAllDevlogs } from '@/lib/notion'

function makeQueryResult(slugs: string[]) {
  return {
    results: slugs.map((slug, i) => ({
      id: `page-id-${i}`,
      properties: {
        Title: { type: 'title', title: [{ plain_text: `Post ${i}` }] },
        Slug: { type: 'rich_text', rich_text: [{ plain_text: slug }] },
        Published: { type: 'checkbox', checkbox: true },
        Date: { type: 'date', date: { start: '2026-03-07' } },
        ProjectId: { type: 'rich_text', rich_text: [{ plain_text: `project-${i}` }] },
        Excerpt: { type: 'rich_text', rich_text: [{ plain_text: `Excerpt ${i}` }] },
      },
    })),
  }
}

describe('getAllDevlogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an array of Notion page results', async () => {
    mocks.mockDatabasesQuery.mockResolvedValue(makeQueryResult(['slug-one', 'slug-two']))

    const results = await getAllDevlogs()

    expect(Array.isArray(results)).toBe(true)
    expect(results).toHaveLength(2)
  })

  it('returns correct slug strings in the results', async () => {
    mocks.mockDatabasesQuery.mockResolvedValue(makeQueryResult(['my-first-post', 'my-second-post']))

    const results = await getAllDevlogs()

    const slugs = results.map(
      (page) =>
        (page.properties as { Slug: { rich_text: { plain_text: string }[] } }).Slug.rich_text[0]
          .plain_text,
    )
    expect(slugs).toContain('my-first-post')
    expect(slugs).toContain('my-second-post')
  })

  it('queries the database with Published: true filter', async () => {
    mocks.mockDatabasesQuery.mockResolvedValue(makeQueryResult([]))

    await getAllDevlogs()

    expect(mocks.mockDatabasesQuery).toHaveBeenCalledTimes(1)
    expect(mocks.mockDatabasesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          property: 'Published',
          checkbox: { equals: true },
        }),
      }),
    )
  })

  it('returns empty array when no published devlogs exist', async () => {
    mocks.mockDatabasesQuery.mockResolvedValue({ results: [] })

    const results = await getAllDevlogs()

    expect(results).toHaveLength(0)
  })

  it('each result contains an id field', async () => {
    mocks.mockDatabasesQuery.mockResolvedValue(makeQueryResult(['test-slug']))

    const results = await getAllDevlogs()

    expect(results[0]).toHaveProperty('id')
    expect(typeof results[0].id).toBe('string')
  })
})
