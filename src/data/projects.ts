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
      'A powerful file conversion tool built with Electron and React.',
    excerpt: 'Seamless conversions, zero friction.',
    tags: ['JavaScript', 'React', 'Electron'],
    devlogSlug: 'uniconvert',
    year: 2026,
    featured: true,
    order: 2,
  },
  {
    id: 'upmods',
    title: 'Upmods',
    description:
      'A mod manager and update tracker for Minecraft. Monitors installed mods across titles and notifies when upstream updates are available.',
    excerpt: 'Update your Minecraft mods to any verison, automatically.',
    tags: ['Ink', 'TypeScript', 'Node.js'],
    devlogSlug: 'upmods',
    year: 2026,
    featured: true,
    order: 3,
  },
  {
    id: 'lumix',
    title: 'Lumix',
    description:
      'Minecraft Server Launcher for Windows.',
    excerpt: 'Launch your minecraft server in seconds.',
    tags: ['TypeScript', 'Electron', 'CSS'],
    devlogSlug: 'lumix',
    year: 2026,
    featured: true,
    order: 4,
  },
  {
    id: 'block-blast-slayer',
    title: 'BlockBlast Slayer',
    description:
      'Solve your BlockBlast puzzle with advanced algorithms.',
    excerpt: 'Solve your BlockBlast puzzle in seconds',
    tags: ['JavaScript', 'CSS', 'HTML', 'PWA'],
    devlogSlug: 'block-blast-slayer',
    year: 2025,
    featured: true,
    order: 5,
  },
]
