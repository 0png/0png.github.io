import { projectBySlug } from '@/lib/terminal/content'

const baseDirectories = new Set(['/', '/home', '/about', '/projects', '/changelog', '/contact'])

export const navHrefForPath = (path: string) => {
  if (path === '/' || path === '/home') return '/'
  if (path === '/about') return '/#about'
  if (path === '/projects') return '/projects'
  if (path.startsWith('/projects/')) return path
  if (path === '/changelog') return '/#changelog'
  if (path === '/contact') return '/#contact'
  return null
}

export const formatCwd = (path: string) => (path === '/' ? '~' : `~${path}`)

export const normalizePath = (rawPath: string, cwd: string) => {
  if (!rawPath || rawPath === '~') return '/'
  if (rawPath === '-') return '/'

  const input =
    rawPath.startsWith('~/')
      ? `/${rawPath.slice(2)}`
      : rawPath.startsWith('/')
        ? rawPath
        : `${cwd === '/' ? '' : cwd}/${rawPath}`

  const parts: string[] = []
  for (const part of input.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }

  return `/${parts.join('/')}`
}

export const isDirectory = (path: string) =>
  baseDirectories.has(path) ||
  (path.startsWith('/projects/') && projectBySlug.has(path.replace('/projects/', '')))
