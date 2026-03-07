export interface Project {
  id: string
  title: string
  description: string
  excerpt: string
  tags: string[]
  devlogSlug: string | null
  coverImage?: string
  year: number
  featured: boolean
  order: number
}

export const projects: Project[] = []
