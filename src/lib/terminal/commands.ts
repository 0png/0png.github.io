import changelog from '@/data/changelog.json'
import { siteConfig } from '@/data/siteConfig'
import { COMMAND_KEYS, HELP_SECTIONS, projectBySlug, projectEntries } from '@/lib/terminal/content'
import { formatCwd, isDirectory, navHrefForPath, normalizePath } from '@/lib/terminal/pathing'
import type { CommandContext, CommandResult, HelpTopic, Line } from '@/lib/terminal/types'
import { mkLine } from '@/lib/terminal/types'

export { COMMAND_KEYS, formatCwd, navHrefForPath, normalizePath }

type ChangelogEntry = {
  date: string
  subject: string
  body: string
  hash: string
}

const changelogEntries = (changelog as ChangelogEntry[]).slice(0, 5)

const formatChangelogPreview = (entry: ChangelogEntry): Line[] => {
  const preview = entry.body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !/^co-authored-by:/i.test(line))
    ?.replace(/^[-*]\s*/, '')

  return [
    mkLine('success', `  ${entry.date}  ${entry.hash}  ${entry.subject}`),
    ...(preview ? [mkLine('out', `    ${preview}`)] : []),
  ]
}

const listDirectory = (path: string): Line[] => {
  if (path === '/' || path === '/home') {
    return [
      mkLine('info', `${path}:`),
      mkLine('out', '  home/       about/      projects/'),
      mkLine('out', '  changelog/  contact/'),
    ]
  }

  if (path === '/about') {
    return [mkLine('info', '/about:'), mkLine('out', '  about_me.txt  stack.txt')]
  }

  if (path === '/projects') {
    return [
      mkLine('info', '/projects:'),
      ...projectEntries.map((project) => mkLine('out', `  ${project.virtualName}/`)),
    ]
  }

  if (path.startsWith('/projects/')) {
    return [mkLine('info', `${path}:`), mkLine('out', '  README.md  metadata.json')]
  }

  if (path === '/changelog') {
    return [mkLine('info', '/changelog:'), mkLine('out', '  commits.log')]
  }

  if (path === '/contact') {
    return [mkLine('info', '/contact:'), mkLine('out', '  github.txt  discord.txt')]
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
      ...changelogEntries.flatMap(formatChangelogPreview),
      mkLine('out', ''),
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
      ...projectEntries.flatMap((project) => [
        mkLine('out', `/projects/${project.virtualName}`),
        mkLine('out', `/projects/${project.virtualName}/README.md`),
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
      ...projectEntries.map((project) => mkLine('out', `/projects/${project.virtualName}`)),
    ]
  }

  return isDirectory(path)
    ? [mkLine('out', path)]
    : [mkLine('err', `find: '${path}': No such file or directory`)]
}

const grepProjects = (term: string): Line[] => {
  const query = term.toLowerCase()
  const matches = projectEntries.filter((project) =>
    [project.title, project.description, project.excerpt, ...project.tags]
      .join(' ')
      .toLowerCase()
      .includes(query)
  )

  if (matches.length === 0) return [mkLine('warn', `grep: no matches for '${term}'`)]

  return matches.map((project) =>
    mkLine('out', `/projects/${project.virtualName}: ${project.title} - ${project.excerpt}`)
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
  ...projectEntries.map((project) => mkLine('out', `  /projects/${project.virtualName}`)),
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
  help: () => ({ lines: helpSummary() }),
  whoami: () => ({
    lines: [mkLine('success', '0png'), mkLine('out', '  Student & AI Developer based in HK')],
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
    lines: [mkLine('info', 'Tech stack:'), mkLine('out', '  Built with Astro, Tailwind, GSAP, and TypeScript.')],
  }),
  ls: (ctx) => ({ lines: listDirectory(ctx.cwd) }),
  'cd /': () => ({ lines: [mkLine('info', 'Navigating to /…')], href: '/', cwd: '/' }),
  'cd /home': () => ({ lines: [mkLine('info', 'Navigating to /home…')], href: '/', cwd: '/' }),
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
    lines: [mkLine('info', 'Navigating to /changelog…')],
    href: '/changelog',
    cwd: '/changelog',
  }),
  'cd /contact': () => ({
    lines: [mkLine('info', 'Navigating to /#contact…')],
    href: '/#contact',
    cwd: '/contact',
  }),
  'cat github.txt': () => ({
    lines: [mkLine('info', 'github.txt'), mkLine('link', 'github.com/0png', 'https://github.com/0png')],
    newTab: 'https://github.com/0png',
  }),
  'sudo rm -rf /': () => ({
    lines: [
      mkLine('warn', 'User is not in the sudoers file.'),
      mkLine('warn', 'This incident will be reported.'),
    ],
  }),
}

export const resolveCommand = (ctx: CommandContext): CommandResult => {
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
        ...projectEntries.map((project, index) =>
          mkLine(
            'out',
            `${index === projectEntries.length - 1 ? '|   `--' : '|   |--'} ${project.virtualName}/`
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
