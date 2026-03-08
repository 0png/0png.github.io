import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { siteConfig } from '@/data/siteConfig'

// These tests will FAIL until src/components/Footer.astro is implemented (T039)

const footerPath = resolve(__dirname, '../../src/components/Footer.astro')

describe('Footer integration', () => {
  it('Footer.astro component file exists', () => {
    expect(existsSync(footerPath)).toBe(true)
  })

  it('Footer renders an anchor with href matching siteConfig.githubUrl', () => {
    const source = readFileSync(footerPath, 'utf-8')
    expect(source).toContain('href={githubUrl}')
  })

  it('Footer GitHub anchor has target="_blank"', () => {
    const source = readFileSync(footerPath, 'utf-8')
    expect(source).toContain('target="_blank"')
  })

  it('Footer GitHub anchor has rel="noopener noreferrer"', () => {
    const source = readFileSync(footerPath, 'utf-8')
    expect(source).toContain('rel="noopener noreferrer"')
  })

  it('Footer contains copyright text with year and 0PNG', () => {
    const source = readFileSync(footerPath, 'utf-8')
    // Matches either © {year} 0PNG or © 0PNG ... {year}
    expect(source).toMatch(/©[^<]*\{year\}[^<]*0PNG|©[^<]*0PNG[^<]*\{year\}/)
  })

  it('siteConfig.githubUrl is a valid GitHub URL', () => {
    expect(siteConfig.githubUrl).toMatch(/^https:\/\/github\.com\//)
  })

  it('siteConfig.year is 2026', () => {
    expect(siteConfig.year).toBe(2026)
  })
})
