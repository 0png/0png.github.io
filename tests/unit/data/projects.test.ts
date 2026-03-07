import { describe, it, expect } from 'vitest'
import { projects } from '@/data/projects'

describe('Project data schema validation', () => {
  it('exports a projects array', () => {
    expect(Array.isArray(projects)).toBe(true)
  })

  it('all project ids are URL-safe (lowercase letters, digits, hyphens only)', () => {
    const urlSafe = /^[a-z0-9-]+$/
    for (const project of projects) {
      expect(project.id).toMatch(urlSafe)
    }
  })

  it('all project tags arrays have 1-5 entries', () => {
    for (const project of projects) {
      expect(project.tags.length).toBeGreaterThanOrEqual(1)
      expect(project.tags.length).toBeLessThanOrEqual(5)
    }
  })

  it('featured projects have unique order values', () => {
    const featuredOrders = projects
      .filter((p) => p.featured)
      .map((p) => p.order)
    const uniqueOrders = new Set(featuredOrders)
    expect(uniqueOrders.size).toBe(featuredOrders.length)
  })
})
