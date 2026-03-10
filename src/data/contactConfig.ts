export interface ContributionDay {
  date: string
  count: number
}

/**
 * Sine-seeded fallback used when GITHUB_TOKEN is absent.
 * Produces a stable, realistic-looking dataset — never shown if the real
 * API call succeeds.
 */
export function generateFallbackContributions(): ContributionDay[] {
  const data: ContributionDay[] = []
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 52 * 7)
  const offset = start.getDay()
  if (offset !== 0) start.setDate(start.getDate() - offset)

  const cur = new Date(start)
  let i = 0
  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0]
    const dow = cur.getDay()
    const r = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1
    let count = 0
    if (dow !== 0 && dow !== 6) {
      if (r > 0.35) count = 1
      if (r > 0.50) count = Math.floor(r * 4) + 1
      if (r > 0.70) count = Math.floor(r * 7) + 3
      if (r > 0.88) count = Math.floor(r * 8) + 8
    } else {
      if (r > 0.65) count = Math.floor(r * 3) + 1
      if (r > 0.85) count = Math.floor(r * 3) + 3
    }
    data.push({ date: dateStr, count })
    cur.setDate(cur.getDate() + 1)
    i++
  }
  return data
}

export const contactConfig = {
  discord: '0png.',
  email: 'hey@0png.dev',
  github: '0png',
  githubUrl: 'https://github.com/0png',
  timezone: 'Asia/Hong_Kong',
  timezoneLabel: 'HKT',
}
