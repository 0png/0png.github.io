import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import gsap from 'gsap'
import TerminalOutput from '@/components/terminal/TerminalOutput'
import { COMMAND_KEYS, formatCwd, resolveCommand } from '@/lib/terminal/commands'
import type { Line } from '@/lib/terminal/types'
import { mkLine } from '@/lib/terminal/types'

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

  const suggestion =
    input.length > 0
      ? (COMMAND_KEYS.find(
          (command) => command.startsWith(input.toLowerCase()) && command !== input.toLowerCase()
        ) ?? '')
      : ''

  const pushLines = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines])
  }, [])

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

  useEffect(() => {
    if (isVisible) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible || !overlayRef.current || !modalRef.current) return
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }
    )
    const timeoutId = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timeoutId)
  }, [isVisible])

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    const handler = () => openPalette()
    window.addEventListener('open-terminal', handler)
    return () => window.removeEventListener('open-terminal', handler)
  }, [openPalette])

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        if (isVisible) closePalette()
        else openPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isVisible, openPalette, closePalette])

  useEffect(() => {
    if (!isVisible) return
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closePalette()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isVisible, closePalette])

  const executeCommand = useCallback(
    (raw: string) => {
      const display = raw.trim()
      const key = display.toLowerCase()

      if (display) {
        pushLines([mkLine('cmd', display)])
        setHistory((prev) => [display, ...prev.filter((item) => item.toLowerCase() !== key)])
        setHistoryIdx(-1)
      }
      setInput('')

      if (!display) return

      if (key === 'clear') {
        setLines([])
        return
      }

      const { lines: outputLines, href, newTab, cwd: nextCwd } = resolveCommand({
        cwd,
        history,
        key,
        display,
      })
      pushLines(outputLines)

      if (nextCwd) setCwd(nextCwd)
      if (href) {
        setTimeout(() => {
          window.location.href = href
        }, 400)
      }
      if (newTab) window.open(newTab, '_blank', 'noopener,noreferrer')
    },
    [cwd, history, pushLines]
  )

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Escape':
        closePalette()
        break
      case 'Enter':
        executeCommand(input)
        break
      case 'Tab':
        event.preventDefault()
        if (suggestion) setInput(suggestion)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (history.length > 0) {
          const next = Math.min(historyIdx + 1, history.length - 1)
          setHistoryIdx(next)
          setInput(history[next])
        }
        break
      case 'ArrowDown':
        event.preventDefault()
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
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-white/[0.07] bg-black/80 px-4 py-3">
          <div
            className="flex gap-1.5"
            onMouseEnter={() => setDotHover(true)}
            onMouseLeave={() => setDotHover(false)}
          >
            <button
              onClick={closePalette}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] transition-opacity hover:opacity-90"
              aria-label="Close terminal"
            >
              {dotHover && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <line x1="2" y1="2" x2="6" y2="6" stroke="#4d0000" strokeWidth="1.35" strokeLinecap="round" />
                  <line x1="6" y1="2" x2="2" y2="6" stroke="#4d0000" strokeWidth="1.35" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setLines([])}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] transition-opacity hover:opacity-90"
              aria-label="Clear terminal output"
            >
              {dotHover && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <line x1="2" y1="4" x2="6" y2="4" stroke="#4d3200" strokeWidth="1.35" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsMaximized((value) => !value)}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] transition-opacity hover:opacity-90"
              aria-label={isMaximized ? 'Restore terminal' : 'Maximize terminal'}
            >
              {dotHover && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  {isMaximized ? (
                    <>
                      <line x1="2" y1="6" x2="6" y2="2" stroke="#003200" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M2 3.25V6H4.75" stroke="#003200" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.25 2H6V4.75" stroke="#003200" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <>
                      <line x1="2" y1="6" x2="6" y2="2" stroke="#003200" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M2 4.75V6H3.25" stroke="#003200" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4.75 2H6V3.25" stroke="#003200" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

        {lines.length > 0 && (
          <div
            ref={outputRef}
            className="term-scrollbar max-h-64 space-y-1 overflow-y-auto px-5 pb-2 pt-4 font-mono text-sm leading-relaxed"
          >
            <TerminalOutput lines={lines} />
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-white/[0.05] px-5 py-4 font-mono text-sm">
          <span className="select-none text-[#61afef]">$</span>
          <div className="relative flex-1">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre"
              aria-hidden="true"
            >
              <span className="text-transparent">{input}</span>
              <span className="text-white/25">{suggestion.slice(input.length)}</span>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
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

          {suggestion && <span className="animate-pulse select-none text-white/30">_</span>}
        </div>
      </div>
    </div>
  )
}
