#!/usr/bin/env node
/**
 * generate-changelog.js
 *
 * Reads the Git log and writes src/data/changelog.json.
 * Uses only Node.js built-in modules — no npm install required.
 *
 * Output schema: Array<{ date: string; subject: string; body: string; hash: string }>
 */

import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────

/** Fetch more raw commits than the final limit to absorb filtered-out entries. */
const FETCH_COUNT = 30

/** Final number of entries written to JSON. */
const OUTPUT_LIMIT = 10

const OUT_PATH = resolve(__dirname, '../src/data/changelog.json')

// Commit subjects to always exclude (case-insensitive prefix match)
const SKIP_PREFIXES = ['ci:', 'init:', 'test:', 'chore: update changelog.json']

// ── Git log parsing ───────────────────────────────────────────────────────────

/**
 * We separate commits with ASCII RS (\x1E, decimal 30) and fields with
 * NUL (\x00). Both characters are exceedingly rare in commit messages and
 * are fully supported by git's --format flag, making the parse 100% robust
 * against newlines, quotes, or special characters in commit bodies.
 */
let raw
try {
  raw = execSync(
    `git log -${FETCH_COUNT} --no-merges --format=%x1E%h%x00%cs%x00%s%x00%b`,
    { encoding: 'utf8' },
  )
} catch (err) {
  console.error('✗ git log failed:', err.message)
  process.exit(1)
}

// ── Transform ─────────────────────────────────────────────────────────────────

const entries = raw
  .split('\x1e')      // split by record separator
  .filter(Boolean)
  .map((record) => {
    const [hash = '', date = '', subject = '', ...rest] = record.split('\x00')

    // Body is everything after the third NUL; rejoin in case body itself had NULs
    const rawBody = rest.join('\x00')

    const body = rawBody
      .split('\n')
      .filter((line) => !/^co-authored-by:/i.test(line.trim()))
      .join('\n')
      .trim()

    return {
      date:    date.trim(),
      subject: subject.trim(),
      body,
      hash:    hash.trim(),
    }
  })
  .filter((e) => {
    if (!e.subject) return false
    const lc = e.subject.toLowerCase()
    return !SKIP_PREFIXES.some((p) => lc.startsWith(p.toLowerCase()))
  })
  .slice(0, OUTPUT_LIMIT)

// ── Write ─────────────────────────────────────────────────────────────────────

writeFileSync(OUT_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf8')

console.log(`✓ Wrote ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} → ${OUT_PATH}`)
