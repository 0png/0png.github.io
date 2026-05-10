import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import gsap from 'gsap'
import { projects } from '@/data/projects'
import { siteConfig } from '@/data/siteConfig'

// ── Line types ──────────────────────────────────────────────────
type LineKind = 'cmd' | 'out' | 'success' | 'info' | 'warn' | 'err' | 'link'
type Line = { id: number; kind: LineKind; text: string; href?: string }

let _lineId = 0
const mkLine = (kind: LineKind, text: string, href?: string): Line => ({
  id: _lineId++,
  kind,
  text,
  href,
})

// ── Command registry ─────────────────────────────────────────────
const projectPaths = projects.flatMap((project) =>
  project.devlogSlug
    ? [`cd /projects/${project.devlogSlug}`, `cat /projects/${project.devlogSlug}/README.md`]
    : []
)

const HELP_SECTIONS = {
  navigation: {
    title: 'Navigation',
    lines: [
      ['pwd', 'print current virtual path'],
      ['ls', 'list files in current path'],
      ['ls /projects', 'list all project directories'],
      ['cd /', 'go to home'],
      ['cd /about', 'jump to About section'],
      ['cd /projects', 'open projects index'],
      ['cd /projects/<slug>', 'open a project devlog'],
      ['cd /changelog', 'jump to changelog section'],
      ['cd /contact', 'jump to contact section'],
      ['cd ..', 'move one level up'],
      ['xdg-open .', 'open current path in the site'],
      ['xdg-open github', 'open GitHub profile'],
      ['xdg-open repo', 'open this site repository'],
    ],
  },
  files: {
    title: 'Files',
    lines: [
      ['tree', 'show the virtual site map'],
      ['cat /about/about_me.txt', 'read profile summary'],
      ['cat /about/stack.txt', 'read tech stack'],
      ['cat /contact/github.txt', 'show GitHub link'],
      ['cat /contact/discord.txt', 'show contact hint'],
      ['cat /changelog/commits.log', 'show changelog hint'],
      ['cat /projects/<slug>/README.md', 'read project summary'],
      ['cat /projects/<slug>/metadata.json', 'read project metadata'],
    ],
  },
  search: {
    title: 'Search',
    lines: [
      ['find /', 'list top-level site paths'],
      ['find /projects', 'list project devlog paths'],
      ['grep -i astro /projects', 'search project metadata'],
      ['grep -i electron /projects', 'search by stack or keyword'],
    ],
  },
  system: {
    title: 'System',
    lines: [
      ['help', 'show categorized command help'],
      ['help all', 'show every command and route'],
      ['help <topic>', 'show one category: navigation, files, search, system'],
      ['man <command>', 'alias for command help'],
      ['history', 'show recent commands'],
      ['date', 'show local browser date'],
      ['uname -a', 'show portfolio shell identity'],
      ['whoami', 'show identity'],
      ['echo <text>', 'print text back'],
      ['clear', 'clear output'],
    ],
  },
} as const

// Full command strings and useful examples — drives Tab autocomplete
const COMMAND_KEYS = [
  'help',
  'help all',
  'help navigation',
  'help files',
  'help search',
  'help system',
  'man cd',
  'man cat',
  'man grep',
  'pwd',
  'tree',
  'find /projects',
  'grep -i astro /projects',
  'uname -a',
  'date',
  'history',
  'whoami',
  'cat about_me.txt',
  'cat /about/about_me.txt',
  'cat /about/stack.txt',
  'cat github.txt',
  'cat /contact/github.txt',
  'hobby.sh --status running',
  'stack',
  'ls',
  'ls /projects',
  'cd /',
  'cd /home',
  'cd /about',
  'cd /projects',
  'cd /changelog',
  'cd /contact',
  'cd ..',
  'xdg-open .',
  'xdg-open github',
  'xdg-open repo',
  'sudo rm -rf /',
  'clear',
  'echo hello',
  ...projectPaths,
]

type CommandResult = { lines: Line[]; href?: string; newTab?: string; cwd?: string }
type CommandContext = { cwd: string; history: string[]; key: string; display: string }
type HelpTopic = keyof typeof HELP_SECTIONS

const projectBySlug = new Map(
  projects
    .filter((project) => project.devlogSlug)
    .map((project) => [project.devlogSlug as string, project])
)

const navHrefForPath = (path: string) => {
  if (path === '/' || path === '/home') return '/'
  if (path === '/about') return '/#about'
  if (path === '/projects') return '/projects'
  if (path.startsWith('/projects/')) return path
  if (path === '/changelog') return '/#changelog'
  if (path === '/contact') return '/#contact'
  return null
}

const formatCwd = (path: string) => (path === '/' ? '~' : `~${path}`)

const normalizePath = (rawPath: string, cwd: string) => {
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

const isDirectory = (path: string) =>
  ['/', '/home', '/about', '/projects', '/changelog', '/contact'].includes(path) ||
  (path.startsWith('/projects/') && projectBySlug.has(path.replace('/projects/', '')))

const listDirectory = (path: string): Line[] => {
  if (path === '/' || path === '/home') {
    return [
      mkLine('info', `${path}:`),
      mkLine('out', '  home/       about/      projects/'),
      mkLine('out', '  changelog/  contact/'),
    ]
  }

  if (path === '/about') {
    return [
      mkLine('info', '/about:'),
      mkLine('out', '  about_me.txt  stack.txt'),
    ]
  }

  if (path === '/projects') {
    return [
      mkLine('info', '/projects:'),
      ...projects.map((project) =>
        mkLine('out', `  ${project.devlogSlug ?? project.id}/`)
      ),
    ]
  }

  if (path.startsWith('/projects/')) {
    return [
      mkLine('info', `${path}:`),
      mkLine('out', '  README.md  metadata.json'),
    ]
  }

  if (path === '/changelog') {
    return [
      mkLine('info', '/changelog:'),
      mkLine('out', '  commits.log'),
    ]
  }

  if (path === '/contact') {
    return [
      mkLine('info', '/contact:'),
      mkLine('out', '  github.txt  discord.txt'),
    ]
  }

  return [mkLine('err', `ls: cannot access '${path}': No such file or directory`)]
}

const readFile = (path: string): Line[] => {
  const filePath =
    path === '/about_me.txt'
      ? '/about/about_me.txt'
      : path === '/github.txt'
        ? '/contact/github.txt'
        : path

  if (filePath === '/about/about_me.txt') {
    return [
      mkLine('info', filePath),
      mkLine('out', `  ${siteConfig.name} - ${siteConfig.bio}`),
      mkLine('out', `  ${siteConfig.headline}`),
    ]
  }

  if (filePath === '/about/stack.txt') {
    return [
      mkLine('info', filePath),
      mkLine('out', '  Astro 5 / TypeScript / React islands'),
      mkLine('out', '  Tailwind CSS v4 / GSAP / Lenis / Vitest'),
    ]
  }

  if (filePath === '/contact/github.txt') {
    return [
      mkLine('info', filePath),
      mkLine('link', siteConfig.githubUrl.replace('https://', ''), siteConfig.githubUrl),
    ]
  }

  if (filePath === '/contact/discord.txt') {
    return [
      mkLine('info', filePath),
      mkLine('out', '  Use the contact dashboard below to copy Discord details.'),
    ]
  }

  if (filePath === '/changelog/commits.log') {
    return [
      mkLine('info', filePath),
      mkLine('out', '  Open /changelog for the full terminal-style commit feed.'),
    ]
  }

  const readmeMatch = filePath.match(/^\/projects\/([^/]+)\/README\.md$/)
  if (readmeMatch) {
    const project = projectBySlug.get(readmeMatch[1])
    if (!project) return [mkLine('err', `cat: ${filePath}: No such file`)]

    return [
      mkLine('info', filePath),
      mkLine('success', project.title),
      mkLine('out', `  ${project.description}`),
      mkLine('out', `  tags: ${project.tags.join(', ')}`),
    ]
  }

  const metadataMatch = filePath.match(/^\/projects\/([^/]+)\/metadata\.json$/)
  if (metadataMatch) {
    const project = projectBySlug.get(metadataMatch[1])
    if (!project) return [mkLine('err', `cat: ${filePath}: No such file`)]

    return [
      mkLine('info', filePath),
      mkLine('out', `  {"year":${project.year},"featured":${project.featured},"status":"devlog"}`),
    ]
  }

  if (isDirectory(filePath)) return [mkLine('err', `cat: ${filePath}: Is a directory`)]
  return [mkLine('err', `cat: ${filePath}: No such file`)]
}

const findEntries = (path: string): Line[] => {
  if (path === '/projects') {
    return [
      mkLine('info', 'find /projects'),
      ...projects.flatMap((project) => [
        mkLine('out', `/projects/${project.devlogSlug ?? project.id}`),
        mkLine('out', `/projects/${project.devlogSlug ?? project.id}/README.md`),
      ]),
    ]
  }

  if (path === '/' || path === '/home') {
    return [
      mkLine('info', 'find /'),
      mkLine('out', '/about'),
      mkLine('out', '/projects'),
      mkLine('out', '/changelog'),
      mkLine('out', '/contact'),
      ...projects.map((project) => mkLine('out', `/projects/${project.devlogSlug ?? project.id}`)),
    ]
  }

  return isDirectory(path)
    ? [mkLine('out', path)]
    : [mkLine('err', `find: '${path}': No such file or directory`)]
}

const grepProjects = (term: string): Line[] => {
  const q = term.toLowerCase()
  const matches = projects.filter((project) =>
    [project.title, project.description, project.excerpt, ...project.tags]
      .join(' ')
      .toLowerCase()
      .includes(q)
  )

  if (matches.length === 0) return [mkLine('warn', `grep: no matches for '${term}'`)]

  return matches.map((project) =>
    mkLine('out', `/projects/${project.devlogSlug ?? project.id}: ${project.title} - ${project.excerpt}`)
  )
}

const formatHelpCommand = ([command, description]: readonly [string, string]) =>
  mkLine('out', `  ${command.padEnd(34)} ${description}`)

const helpSummary = (): Line[] => [
  mkLine('info', '0PNG shell help'),
  mkLine('out', '  Type a command then press Tab to autocomplete.'),
  mkLine('out', '  Use ↑ / ↓ for history. Paths work like a small Linux filesystem.'),
  mkLine('out', ''),
  mkLine('info', 'Categories:'),
  mkLine('out', '  help navigation    cd, ls, pwd, xdg-open'),
  mkLine('out', '  help files         tree, cat, virtual files'),
  mkLine('out', '  help search        find, grep'),
  mkLine('out', '  help system        history, date, uname, clear'),
  mkLine('out', '  help all           full command list'),
  mkLine('out', ''),
  mkLine('info', 'Useful starts:'),
  mkLine('out', '  ls /projects'),
  mkLine('out', '  cd /projects/0png-portfolio'),
  mkLine('out', '  cat README.md'),
  mkLine('out', '  grep -i electron /projects'),
]

const helpForTopic = (topic: HelpTopic): Line[] => [
  mkLine('info', HELP_SECTIONS[topic].title),
  ...HELP_SECTIONS[topic].lines.map(formatHelpCommand),
]

const helpAll = (): Line[] => [
  mkLine('info', 'All commands'),
  ...Object.keys(HELP_SECTIONS).flatMap((topic) => [
    mkLine('info', HELP_SECTIONS[topic as HelpTopic].title),
    ...HELP_SECTIONS[topic as HelpTopic].lines.map(formatHelpCommand),
  ]),
  mkLine('info', 'Project routes'),
  ...projects.map((project) =>
    mkLine('out', `  /projects/${project.devlogSlug ?? project.id}`)
  ),
]

const helpForCommand = (command: string): Line[] => {
  const topicByCommand: Record<string, HelpTopic> = {
    pwd: 'navigation',
    ls: 'navigation',
    cd: 'navigation',
    'xdg-open': 'navigation',
    tree: 'files',
    cat: 'files',
    find: 'search',
    grep: 'search',
    help: 'system',
    man: 'system',
    history: 'system',
    date: 'system',
    uname: 'system',
    whoami: 'system',
    echo: 'system',
    clear: 'system',
  }
  const topic = topicByCommand[command]

  if (!topic) {
    return [
      mkLine('err', `help: no manual entry for '${command}'`),
      mkLine('out', '  Try: help navigation, help files, help search, help system, help all'),
    ]
  }

  return helpForTopic(topic)
}

const commandMap: Record<string, (ctx: CommandContext) => CommandResult> = {
  help: () => ({
    lines: helpSummary(),
  }),

  whoami: () => ({
    lines: [
      mkLine('success', '0png'),
      mkLine('out', '  Student & AI Developer based in HK'),
    ],
  }),

  'cat about_me.txt': () => ({
    lines: [
      mkLine('info', 'about_me.txt'),
      mkLine('out', '  I focus on turning ideas into functional tools'),
      mkLine('out', '  by leveraging AI to solve daily problems and'),
      mkLine('out', '  supercharge my study workflow.'),
    ],
  }),

  'hobby.sh --status running': () => ({
    lines: [
      mkLine('success', 'status: running'),
      mkLine('out', "  When not coding, I'm out on a run —"),
      mkLine('out', '  the perfect reset before the next build.'),
    ],
  }),

  stack: () => ({
    lines: [
      mkLine('info', 'Tech stack:'),
      mkLine('out', '  Built with Astro, Tailwind, GSAP, and TypeScript.'),
    ],
  }),

  ls: (ctx) => ({
    lines: listDirectory(ctx.cwd),
  }),

  'cd /': () => ({
    lines: [mkLine('info', 'Navigating to /…')],
    href: '/',
    cwd: '/',
  }),

  'cd /home': () => ({
    lines: [mkLine('info', 'Navigating to /home…')],
    href: '/',
    cwd: '/',
  }),

  'cd /about': () => ({
    lines: [mkLine('info', 'Navigating to /about…')],
    href: '/#about',
    cwd: '/about',
  }),

  'cd /projects': () => ({
    lines: [mkLine('info', 'Navigating to /projects…')],
    href: '/projects',
    cwd: '/projects',
  }),

  'cd /changelog': () => ({
    lines: [mkLine('info', 'Navigating to /#changelog…')],
    href: '/#changelog',
    cwd: '/changelog',
  }),

  'cd /contact': () => ({
    lines: [mkLine('info', 'Navigating to /#contact…')],
    href: '/#contact',
    cwd: '/contact',
  }),

  'cat github.txt': () => ({
    lines: [
      mkLine('info', 'github.txt'),
      mkLine('link', 'github.com/0png', 'https://github.com/0png'),
    ],
    newTab: 'https://github.com/0png',
  }),

  'sudo rm -rf /': () => ({
    lines: [
      mkLine('warn', 'User is not in the sudoers file.'),
      mkLine('warn', 'This incident will be reported.'),
    ],
  }),
}

const resolveCommand = (ctx: CommandContext): CommandResult => {
  const exact = commandMap[ctx.key]
  if (exact) return exact(ctx)

  const [cmd, ...args] = ctx.display.trim().split(/\s+/)

  if (cmd === 'help') {
    const topic = args[0]?.toLowerCase()
    if (!topic) return { lines: helpSummary() }
    if (topic === 'all') return { lines: helpAll() }
    if (topic in HELP_SECTIONS) return { lines: helpForTopic(topic as HelpTopic) }
    return { lines: helpForCommand(topic) }
  }

  if (cmd === 'man') {
    const topic = args[0]?.toLowerCase()
    if (!topic) return { lines: [mkLine('err', 'man: what manual page do you want?')] }
    return { lines: helpForCommand(topic) }
  }

  if (cmd === 'pwd') return { lines: [mkLine('out', ctx.cwd)] }

  if (cmd === 'ls') {
    const path = normalizePath(args[0] ?? '.', ctx.cwd)
    return { lines: listDirectory(path) }
  }

  if (cmd === 'cd') {
    const path = normalizePath(args[0] ?? '~', ctx.cwd)
    if (!isDirectory(path)) {
      return { lines: [mkLine('err', `cd: no such file or directory: ${args[0] ?? '~'}`)] }
    }

    const href = navHrefForPath(path)
    return {
      lines: [mkLine('info', `Navigating to ${path}…`)],
      cwd: path === '/home' ? '/' : path,
      href: href ?? undefined,
    }
  }

  if (cmd === 'cat') {
    const path = normalizePath(args[0] ?? '', ctx.cwd)
    return { lines: readFile(path) }
  }

  if (cmd === 'tree') {
    return {
      lines: [
        mkLine('info', '/'),
        mkLine('out', '|-- about/'),
        mkLine('out', '|   |-- about_me.txt'),
        mkLine('out', '|   `-- stack.txt'),
        mkLine('out', '|-- projects/'),
        ...projects.map((project, index) =>
          mkLine(
            'out',
            `${index === projects.length - 1 ? '|   `--' : '|   |--'} ${project.devlogSlug ?? project.id}/`
          )
        ),
        mkLine('out', '|-- changelog/'),
        mkLine('out', '`-- contact/'),
      ],
    }
  }

  if (cmd === 'find') {
    const targetArg = args.find((arg) => !arg.startsWith('-')) ?? '.'
    return { lines: findEntries(normalizePath(targetArg, ctx.cwd)) }
  }

  if (cmd === 'grep') {
    const nonFlags = args.filter((arg) => !arg.startsWith('-'))
    const term = nonFlags[0]
    const target = normalizePath(nonFlags[1] ?? '.', ctx.cwd)
    if (!term) return { lines: [mkLine('err', 'grep: missing search pattern')] }
    if (target !== '/projects') {
      return { lines: [mkLine('err', 'grep: supported target is /projects')] }
    }
    return { lines: grepProjects(term) }
  }

  if (cmd === 'xdg-open') {
    const target = args[0] ?? '.'
    if (target === 'github') {
      return {
        lines: [mkLine('link', siteConfig.githubUrl.replace('https://', ''), siteConfig.githubUrl)],
        newTab: siteConfig.githubUrl,
      }
    }
    if (target === 'repo') {
      const repo = 'https://github.com/0png/0png.github.io'
      return { lines: [mkLine('link', repo.replace('https://', ''), repo)], newTab: repo }
    }

    const path = normalizePath(target, ctx.cwd)
    const href = navHrefForPath(path)
    if (!href) return { lines: [mkLine('err', `xdg-open: ${target}: No such file or URL`)] }
    return { lines: [mkLine('info', `Opening ${path}…`)], href, cwd: path }
  }

  if (cmd === 'history') {
    return {
      lines:
        ctx.history.length === 0
          ? [mkLine('warn', 'history: no commands yet')]
          : ctx.history.slice(0, 10).map((item, index) => mkLine('out', `  ${index + 1}  ${item}`)),
    }
  }

  if (cmd === 'date') return { lines: [mkLine('out', new Date().toString())] }

  if (cmd === 'uname' && args[0] === '-a') {
    return { lines: [mkLine('out', '0png.dev 6.5.0-portfolio astro-ts-gsap x86_64 GNU/Linux')] }
  }

  if (cmd === 'echo') return { lines: [mkLine('out', args.join(' '))] }

  return { lines: [mkLine('err', "[ COMMAND NOT FOUND ]: type 'help' for instructions")] }
}

// ── Component ───────────────────────────────────────────────────
export default function TerminalPalette() {
  const [isVisible, setIsVisible] = useState(false)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [isMaximized, setIsMaximized] = useState(false)
  const [dotHover, setDotHover] = useState(false)
  const [cwd, setCwd] = useState('/')

  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // The first command whose name starts with the current input (but is not identical)
  const suggestion =
    input.length > 0
      ? (COMMAND_KEYS.find(
          (cmd) => cmd.startsWith(input.toLowerCase()) && cmd !== input.toLowerCase()
        ) ?? '')
      : ''

  // ── Helpers ──────────────────────────────────────────────────
  const pushLines = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines])
  }, [])

  // ── Open / close ─────────────────────────────────────────────
  const openPalette = useCallback(() => {
    setIsVisible(true)
  }, [])

  const closePalette = useCallback(() => {
    if (!overlayRef.current || !modalRef.current) return
    gsap.to(modalRef.current, { opacity: 0, y: -12, duration: 0.18, ease: 'power2.in' })
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => setIsVisible(false),
    })
  }, [])

  // ── Body scroll lock ─────────────────────────────────────────
  useEffect(() => {
    if (isVisible) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  // ── Animate in when mounted ───────────────────────────────────
  useEffect(() => {
    if (!isVisible || !overlayRef.current || !modalRef.current) return
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }
    )
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isVisible])

  // ── Auto-scroll output ────────────────────────────────────────
  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  // ── External open trigger (dispatched by Hero button) ────────
  useEffect(() => {
    const handler = () => openPalette()
    window.addEventListener('open-terminal', handler)
    return () => window.removeEventListener('open-terminal', handler)
  }, [openPalette])

  // ── Global Ctrl+K / Cmd+K ────────────────────────────────────
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isVisible) closePalette()
        else openPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isVisible, openPalette, closePalette])

  // ── Global Escape to close ────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closePalette()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isVisible, closePalette])

  // ── Command execution ─────────────────────────────────────────
  const executeCommand = useCallback(
    (raw: string) => {
      const display = raw.trim()
      const key = display.toLowerCase()

      if (display) {
        pushLines([mkLine('cmd', display)])
        setHistory((prev) => [display, ...prev.filter((h) => h.toLowerCase() !== key)])
        setHistoryIdx(-1)
      }
      setInput('')

      if (!display) return

      // Special case: clear resets the lines array entirely
      if (key === 'clear') {
        setLines([])
        return
      }

      const { lines: outLines, href, newTab, cwd: nextCwd } = resolveCommand({
        cwd,
        history,
        key,
        display,
      })
      pushLines(outLines)

      if (nextCwd) setCwd(nextCwd)
      if (href) setTimeout(() => { window.location.href = href }, 400)
      if (newTab) window.open(newTab, '_blank', 'noopener,noreferrer')
    },
    [cwd, history, pushLines]
  )

  // ── Input keyboard handler ────────────────────────────────────
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        closePalette()
        break
      case 'Enter':
        executeCommand(input)
        break
      case 'Tab':
        e.preventDefault()
        if (suggestion) setInput(suggestion)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (history.length > 0) {
          const next = Math.min(historyIdx + 1, history.length - 1)
          setHistoryIdx(next)
          setInput(history[next])
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (historyIdx > 0) {
          const next = historyIdx - 1
          setHistoryIdx(next)
          setInput(history[next])
        } else {
          setHistoryIdx(-1)
          setInput('')
        }
        break
    }
  }

  if (!isVisible) return null

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closePalette}
      role="dialog"
      aria-modal="true"
      aria-label="Terminal command palette"
    >
      <div
        ref={modalRef}
        className={`terminal-palette mx-4 w-full overflow-hidden rounded-lg border border-white/10 bg-neutral-950 shadow-2xl transition-[max-width] duration-300 ${isMaximized ? 'max-w-5xl' : 'max-w-2xl'}`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* ── Window chrome ── */}
        <div className="flex items-center gap-2 border-b border-white/[0.07] bg-black/80 px-4 py-3">
          <div
            className="flex gap-1.5"
            onMouseEnter={() => setDotHover(true)}
            onMouseLeave={() => setDotHover(false)}
          >
            {/* Red — close */}
            <button
              onClick={closePalette}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] transition-opacity hover:opacity-90"
              aria-label="Close terminal"
            >
              {dotHover && (
                <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                  <line x1="1" y1="1" x2="5" y2="5" stroke="#4d0000" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="5" y1="1" x2="1" y2="5" stroke="#4d0000" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Yellow — clear output */}
            <button
              onClick={() => setLines([])}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] transition-opacity hover:opacity-90"
              aria-label="Clear terminal output"
            >
              {dotHover && (
                <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                  <line x1="1" y1="3" x2="5" y2="3" stroke="#4d3200" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Green — maximize / restore */}
            <button
              onClick={() => setIsMaximized((v) => !v)}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] transition-opacity hover:opacity-90"
              aria-label={isMaximized ? 'Restore terminal' : 'Maximize terminal'}
            >
              {dotHover && (
                <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                  {isMaximized ? (
                    /* Restore: two arrows pointing inward */
                    <>
                      <line x1="1.5" y1="4.5" x2="4.5" y2="1.5" stroke="#003200" strokeWidth="1.1" strokeLinecap="round" />
                      <polyline points="1.5,2.5 1.5,4.5 3.5,4.5" stroke="#003200" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <polyline points="4.5,3.5 4.5,1.5 2.5,1.5" stroke="#003200" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </>
                  ) : (
                    /* Maximize: two arrows pointing outward */
                    <>
                      <line x1="1.5" y1="4.5" x2="4.5" y2="1.5" stroke="#003200" strokeWidth="1.1" strokeLinecap="round" />
                      <polyline points="3.5,4.5 1.5,4.5 1.5,2.5" stroke="#003200" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <polyline points="2.5,1.5 4.5,1.5 4.5,3.5" stroke="#003200" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </>
                  )}
                </svg>
              )}
            </button>
          </div>
          <span className="ml-3 font-mono text-xs text-white/25">{formatCwd(cwd)} — terminal</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/20">
            esc to close
          </span>
        </div>

        {/* ── Output area ── */}
        {lines.length > 0 && (
          <div
            ref={outputRef}
            className="term-scrollbar max-h-64 space-y-1 overflow-y-auto px-5 pb-2 pt-4 font-mono text-sm leading-relaxed"
          >
            {lines.map((line) => {
              if (line.kind === 'cmd')
                return (
                  <p key={line.id}>
                    <span className="text-[#61afef]">$</span>
                    <span className="ml-2 text-[#98c379]">{line.text}</span>
                  </p>
                )
              if (line.kind === 'out')
                return (
                  <p key={line.id} className="pl-2 text-white/55">
                    {line.text}
                  </p>
                )
              if (line.kind === 'success')
                return (
                  <p key={line.id}>
                    <span className="text-[#98c379]">✓</span>
                    <span className="ml-2 text-[#98c379]">{line.text}</span>
                  </p>
                )
              if (line.kind === 'info')
                return (
                  <p key={line.id}>
                    <span className="text-[#56b6c2]">›</span>
                    <span className="ml-2 text-[#56b6c2]">{line.text}</span>
                  </p>
                )
              if (line.kind === 'warn')
                return (
                  <p key={line.id}>
                    <span className="text-[#e5c07b]">⚠</span>
                    <span className="ml-2 text-[#e5c07b]">{line.text}</span>
                  </p>
                )
              if (line.kind === 'err')
                return (
                  <p key={line.id}>
                    <span className="text-[#e06c75]">✗</span>
                    <span className="ml-2 text-[#e06c75]/80">{line.text}</span>
                  </p>
                )
              if (line.kind === 'link')
                return (
                  <p key={line.id}>
                    <span className="text-[#56b6c2]">⎋</span>
                    <a
                      href={line.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[#61afef] underline underline-offset-2 transition-colors hover:text-white"
                    >
                      {line.text}
                    </a>
                  </p>
                )
              return null
            })}
          </div>
        )}

        {/* ── Input row ── */}
        <div className="flex items-center gap-3 border-t border-white/[0.05] px-5 py-4 font-mono text-sm">
          <span className="select-none text-[#61afef]">$</span>

          {/* Ghost-text + real input wrapper */}
          <div className="relative flex-1">
            {/* Ghost layer — sits behind the input */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre"
              aria-hidden="true"
            >
              {/* Transparent spacer matching the typed chars */}
              <span className="text-transparent">{input}</span>
              {/* Visible autocomplete hint */}
              <span className="text-white/25">{suggestion.slice(input.length)}</span>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setHistoryIdx(-1)
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-white/90 outline-none placeholder:text-white/20"
              placeholder={lines.length === 0 ? 'type "help" for available commands' : ''}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          {/* Blinking cursor when a suggestion is available */}
          {suggestion && (
            <span className="animate-pulse select-none text-white/30">_</span>
          )}
        </div>
      </div>
    </div>
  )
}
