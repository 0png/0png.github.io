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

export const projects: Project[] = [
  {
    id: '0png-portfolio',
    title: '0PNG Portfolio',
    description:
      "Personal portfolio website built with Astro, GSAP, and Notion API. Features horizontal scroll, smooth animations, and a Notion-powered devlog.",
    excerpt: "The site you're looking at right now.",
    tags: ['Astro', 'GSAP', 'TypeScript', 'Notion'],
    devlogSlug: 'building-0png-portfolio',
    year: 2026,
    featured: true,
    order: 1,
  },
  {
    id: 'ai-study-tool',
    title: 'AI Study Tool',
    description:
      'An AI-powered study assistant that generates flashcards and quizzes from uploaded notes. Built to replace repetitive manual study prep.',
    excerpt: 'Turn your notes into quizzes automatically.',
    tags: ['Python', 'AI', 'React'],
    devlogSlug: null,
    year: 2025,
    featured: true,
    order: 2,
  },
  {
    id: 'run-tracker',
    title: 'Run Tracker',
    description:
      'A minimalist long-distance run tracker with pace analytics and training load insights. Syncs with Strava and provides actionable feedback.',
    excerpt: 'Training analytics for distance runners.',
    tags: ['TypeScript', 'Node.js', 'Strava API'],
    devlogSlug: null,
    year: 2025,
    featured: true,
    order: 3,
  },
]
