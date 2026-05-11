import { projects } from '@/data/projects'

export const projectEntries = projects.map((project) => ({
  ...project,
  virtualName: project.devlogSlug ?? project.id,
}))

export const projectPaths = projectEntries.flatMap((project) =>
  project.devlogSlug
    ? [`cd /projects/${project.devlogSlug}`, `cat /projects/${project.devlogSlug}/README.md`]
    : []
)

export const projectBySlug = new Map(
  projectEntries
    .filter((project) => project.devlogSlug)
    .map((project) => [project.devlogSlug as string, project])
)

export const HELP_SECTIONS = {
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

export const COMMAND_KEYS = [
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
