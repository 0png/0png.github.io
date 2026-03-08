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
      'Personal portfolio website built with Astro, GSAP, and Tailwind CSS v4. Features horizontal scroll, smooth animations, and a full-viewport footer.',
    excerpt: "The site you're looking at right now.",
    tags: ['Astro', 'GSAP', 'TypeScript', 'Tailwind'],
    devlogSlug: '0png-portfolio',
    year: 2026,
    featured: true,
    order: 1,
  },
  {
    id: 'uniconvert',
    title: 'Uniconvert',
    description:
      'A fast, offline-first unit converter covering length, mass, temperature, currency, and more. No ads, no tracking, just conversions.',
    excerpt: 'Every unit. No friction.',
    tags: ['TypeScript', 'React', 'Electron'],
    devlogSlug: 'uniconvert',
    year: 2026,
    featured: true,
    order: 2,
  },
  {
    id: 'upmods',
    title: 'Upmods',
    description:
      'A mod manager and update tracker for PC games. Monitors installed mods across titles and notifies when upstream updates are available.',
    excerpt: 'Keep your mods current, automatically.',
    tags: ['Electron', 'TypeScript', 'Node.js'],
    devlogSlug: 'upmods',
    year: 2026,
    featured: true,
    order: 3,
  },
  {
    id: 'lumix',
    title: 'Lumix',
    description:
      'A minimal ambient lighting app that syncs screen edge colours to smart bulbs in real time, extending the on-screen image into the room.',
    excerpt: 'Your screen, ambient.',
    tags: ['Python', 'Tauri', 'Rust'],
    devlogSlug: 'lumix',
    year: 2026,
    featured: true,
    order: 4,
  },
  {
    id: 'block-blast-slayer',
    title: 'BlockBlastSlayer',
    description:
      'An AI agent that plays and solves Block Blast puzzles autonomously. Uses computer vision to read the board state and a greedy solver to find optimal placements.',
    excerpt: 'AI that plays Block Blast so you don\'t have to.',
    tags: ['Python', 'OpenCV', 'AI'],
    devlogSlug: 'block-blast-slayer',
    year: 2025,
    featured: true,
    order: 5,
  },
]
