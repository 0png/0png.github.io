import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).min(1).max(5),
    repoUrl: z.string().url(),
    demoUrl: z.string().url().optional(),
    status: z.enum(['active', 'wip', 'archived']),
    excerpt: z.string(),
  }),
})

export const collections = { projects }
