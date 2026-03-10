#!/usr/bin/env node
/**
 * fetch-github-stats.js
 *
 * Fetches the last 100 days of GitHub contribution data using the GitHub CLI.
 * Zero secrets: relies on `gh auth login` — no tokens, no environment variables.
 *
 * Prerequisites:
 *   gh auth login       (one-time browser-based setup)
 *
 * Usage:
 *   node scripts/fetch-github-stats.js
 *
 * Output:
 *   src/data/github-stats.json
 *   Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>
 *
 * Level mapping (relative to personal max day):
 *   0 = no activity
 *   1 = 1–24% of max
 *   2 = 25–49% of max
 *   3 = 50–74% of max
 *   4 = 75–100% of max
 */

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────

const GITHUB_LOGIN = '0png'
const DAYS = 100
const OUT_PATH = resolve(__dirname, '../src/data/github-stats.json')

// ── Date range ────────────────────────────────────────────────────────────────

const to = new Date()
const from = new Date(to)
from.setDate(from.getDate() - (DAYS - 1))

// ── GraphQL query ─────────────────────────────────────────────────────────────

const query = /* graphql */ `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

const payload = JSON.stringify({
  query,
  variables: {
    login: GITHUB_LOGIN,
    from: from.toISOString(),
    to: to.toISOString(),
  },
})

// ── Fetch via gh CLI ──────────────────────────────────────────────────────────

console.log(`[fetch-github-stats] Querying @${GITHUB_LOGIN} — last ${DAYS} days…`)

let raw
try {
  raw = execFileSync('gh', ['api', 'graphql', '--input', '-'], {
    input: payload,
    encoding: 'utf8',
  })
} catch (err) {
  console.error('[fetch-github-stats] ✗ gh call failed:', err.message)
  console.error('  Make sure `gh auth login` has been run and gh ≥ 2.x is installed.')
  process.exit(1)
}

// ── Parse ─────────────────────────────────────────────────────────────────────

let data
try {
  data = JSON.parse(raw)
} catch {
  console.error('[fetch-github-stats] ✗ Could not parse gh response:', raw)
  process.exit(1)
}

const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks
if (!weeks) {
  console.error('[fetch-github-stats] ✗ Unexpected response shape:', JSON.stringify(data, null, 2))
  process.exit(1)
}

// ── Transform ─────────────────────────────────────────────────────────────────

const allDays = weeks
  .flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
    })),
  )
  .slice(-DAYS)

const maxCount = Math.max(...allDays.map((d) => d.count), 1)

/** Map a raw contribution count to intensity level 0–4. */
function getLevel(count) {
  if (count === 0) return 0
  const ratio = count / maxCount
  if (ratio < 0.25) return 1
  if (ratio < 0.50) return 2
  if (ratio < 0.75) return 3
  return 4
}

const stats = allDays.map((d) => ({
  date: d.date,
  count: d.count,
  level: getLevel(d.count),
}))

// ── Write ─────────────────────────────────────────────────────────────────────

writeFileSync(OUT_PATH, JSON.stringify(stats, null, 2) + '\n', 'utf8')
console.log(`[fetch-github-stats] ✓ Wrote ${stats.length} days → ${OUT_PATH}`)
