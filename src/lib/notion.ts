import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

export interface DevlogEntry {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  projectId: string
  published: boolean
  markdown: string
}

type NotionProps = {
  Title: { title: { plain_text: string }[] }
  Slug: { rich_text: { plain_text: string }[] }
  Published: { checkbox: boolean }
  Date: { date: { start: string } | null }
  ProjectId: { rich_text: { plain_text: string }[] }
  Excerpt: { rich_text: { plain_text: string }[] }
}

export function transformNotionPage(page: PageObjectResponse): DevlogEntry | null {
  const props = page.properties as unknown as NotionProps

  if (!props.Published.checkbox) return null

  const slug = props.Slug.rich_text[0]?.plain_text
  const title = props.Title.title[0]?.plain_text
  const projectId = props.ProjectId.rich_text[0]?.plain_text

  if (!slug) throw new Error('Missing required Notion property: Slug')
  if (!title) throw new Error('Missing required Notion property: Title')
  if (!projectId) throw new Error('Missing required Notion property: ProjectId')

  return {
    id: page.id,
    slug,
    title,
    excerpt: props.Excerpt.rich_text[0]?.plain_text ?? '',
    date: props.Date.date?.start ?? '',
    projectId,
    published: true,
    markdown: '',
  }
}

export async function getAllDevlogs() {
  const response = await notion.databases.query({
    database_id: import.meta.env.NOTION_DATABASE_ID ?? '',
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })
  return response.results
}

export async function getDevlogBySlug(slug: string) {
  const response = await notion.databases.query({
    database_id: import.meta.env.NOTION_DATABASE_ID ?? '',
    filter: { property: 'Slug', rich_text: { equals: slug } },
  })
  const page = response.results[0]
  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const mdString = n2m.toMarkdownString(mdBlocks)
  return { page, markdown: mdString.parent }
}
