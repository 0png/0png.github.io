import { getCollection } from 'astro:content'

const STATIC_ROUTES = ['/', '/projects', '/changelog']

function toAbsoluteUrl(path: string, site: URL) {
  return new URL(path, site).toString()
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET({ site }: { site?: URL }) {
  if (!site) {
    throw new Error('Astro site config is required to generate sitemap.xml')
  }

  const projectEntries = await getCollection('projects')
  const urls = [
    ...STATIC_ROUTES.map((path) => ({
      loc: toAbsoluteUrl(path, site),
    })),
    ...projectEntries.map((entry) => ({
      loc: toAbsoluteUrl(`/projects/${entry.slug}`, site),
      lastmod: entry.data.date.toISOString(),
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
