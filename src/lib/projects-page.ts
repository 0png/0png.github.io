import type { Project } from '@/data/projects'

export const PROJECTS_MOBILE_BREAKPOINT = 980
export const PROJECTS_FOCUS_START = 0.28
export const PROJECTS_FOCUS_END = 0.72

export type ProjectsPageData = {
  allProjects: Project[]
  featuredProjects: Project[]
  allTags: string[]
  latestYear: number
}

export const getProjectsPageData = (inputProjects: Project[]): ProjectsPageData => {
  const allProjects = [...inputProjects].sort((a, b) => a.order - b.order)
  const featuredProjects = allProjects.filter((project) => project.featured)
  const allTags = [...new Set(allProjects.flatMap((project) => project.tags))].sort()
  const latestYear = Math.max(...allProjects.map((project) => project.year))

  return {
    allProjects,
    featuredProjects,
    allTags,
    latestYear,
  }
}

export const matchesProjectFilter = (tags: string[], filter: string) =>
  filter === 'all' || tags.includes(filter)
