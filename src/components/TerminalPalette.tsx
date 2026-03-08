import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import gsap from 'gsap'

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
// Full command strings — drives both execution and Tab autocomplete
const COMMAND_KEYS = [
  'help',
  'whoami',
  'cat about_me.txt',
  'cat github.txt',
  'hobby.sh --status running',
  'stack',
  'ls',
  'cd /',
  'cd /about',
  'cd /projects',
  'cd /changelog',
  'sudo rm -rf /',
  'clear',
] as const

type CommandResult = { lines: Line[]; href?: string; newTab?: string }

const commandMap: Record<string, () => CommandResult> = {
  help: () => ({
    lines: [
      mkLine('info', 'Available commands:'),
      mkLine('out', '  help                       →  Show this message'),
      mkLine('out', '  whoami                     →  Who is 0png'),
      mkLine('out', '  cat about_me.txt           →  Read the about file'),
      mkLine('out', '  cat github.txt             →  Open GitHub profile'),
      mkLine('out', '  hobby.sh --status running  →  Current hobby status'),
      mkLine('out', '  stack                      →  Tech stack info'),
      mkLine('out', '  ls                         →  List all pages'),
      mkLine('out', '  cd /                       →  Navigate to Home'),
      mkLine('out', '  cd /about                  →  Navigate to About section'),
      mkLine('out', '  cd /projects               →  Navigate to Projects page'),
      mkLine('out', '  cd /changelog              →  Navigate to Changelog section'),
      mkLine('out', "  sudo rm -rf /              →  ...please don't"),
      mkLine('out', '  clear                      →  Clear terminal output'),
    ],
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

  ls: () => ({
    lines: [
      mkLine('info', 'Pages:'),
      mkLine('out', '  /           →  Home'),
      mkLine('out', '  /about      →  About section'),
      mkLine('out', '  /projects   →  Projects listing'),
      mkLine('out', '  /changelog  →  Changelog section'),
    ],
  }),

  'cd /': () => ({
    lines: [mkLine('info', 'Navigating to /…')],
    href: '/',
  }),

  'cd /about': () => ({
    lines: [mkLine('info', 'Navigating to /about…')],
    href: '/#about',
  }),

  'cd /projects': () => ({
    lines: [mkLine('info', 'Navigating to /projects…')],
    href: '/projects',
  }),

  'cd /changelog': () => ({
    lines: [mkLine('info', 'Navigating to /#changelog…')],
    href: '/#changelog',
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

// ── Component ───────────────────────────────────────────────────
export default function TerminalPalette() {
  const [isVisible, setIsVisible] = useState(false)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

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

      const handler = commandMap[key]

      if (!handler) {
        pushLines([mkLine('err', "[ COMMAND NOT FOUND ]: type 'help' for instructions")])
        return
      }

      const { lines: outLines, href, newTab } = handler()
      pushLines(outLines)

      if (href) setTimeout(() => { window.location.href = href }, 400)
      if (newTab) window.open(newTab, '_blank', 'noopener,noreferrer')
    },
    [pushLines]
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
        className="terminal-palette mx-4 w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* ── Window chrome ── */}
        <div className="flex items-center gap-2 border-b border-white/[0.07] bg-black/80 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-3 font-mono text-xs text-white/25">~/0png — terminal</span>
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
