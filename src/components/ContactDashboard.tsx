import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface ActivityLogEntry {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface Props {
  activityLog?: ActivityLogEntry[]
  discord: string
  email: string
  githubUrl: string
  github: string
}

// Opacity for each intensity level (green-scale)
const LOG_OPACITIES: Record<number, number> = {
  0: 0.06,
  1: 0.2,
  2: 0.45,
  3: 0.7,
  4: 1.0,
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Mirrors the Changelog's center node exactly
function SpineNode() {
  return (
    <div className="absolute z-10 flex items-center justify-center" style={{ left: 14, top: 18 }}>
      <div className="absolute h-5 w-5 rounded-full bg-emerald-400/[0.08] animate-pulse" />
      <div
        className="relative h-[11px] w-[11px] rounded-full bg-neutral-950"
        style={{
          border: '1px solid rgba(52,211,153,0.55)',
          boxShadow: '0 0 8px rgba(52,211,153,0.22)',
        }}
      />
    </div>
  )
}

function Tag({ children }: { children: string }) {
  return (
    <span className="shrink-0 font-mono text-[11px] font-semibold tracking-widest text-emerald-400">
      {children}
    </span>
  )
}

function Sep() {
  return <span className="shrink-0 font-mono text-[13px] text-white/20 leading-none">›</span>
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContactDashboard({ activityLog = [], discord, email, githubUrl, github }: Props) {
  const [logTooltip, setLogTooltip] = useState<{
    entry: ActivityLogEntry
    // Fixed viewport coords derived from getBoundingClientRect — stable across scroll/layout shifts
    x: number // center of the bar (clientX + scrollX)
    y: number // top of the bar (clientY + scrollY)
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [time, setTime] = useState('--:--:--')

  const totalCommits = activityLog.reduce((sum, d) => sum + d.count, 0)

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Hong_Kong',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const copyDiscord = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(discord)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [discord])

  // Layout constants — spine at 24 px from left edge of the container
  const SPINE_X = 24
  const CONTENT_LEFT = 56 // pl-14

  const ROW = 'relative border-b border-white/[0.04] last:border-0 py-5'

  return (
    <div className="relative">
      {/* Fixed tooltip — portalled to document.body to escape backdrop-filter stacking context */}
      {logTooltip && createPortal(
        <div
          className="fixed z-[999] pointer-events-none rounded-sm border border-emerald-400/20 bg-neutral-950 px-2.5 py-1.5 font-mono text-[10px] text-white shadow-xl whitespace-nowrap"
          style={{
            left: logTooltip.x,
            top: logTooltip.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {logTooltip.entry.count === 0 ? 'No commits' : `${logTooltip.entry.count} commits`}
          <span className="text-white/30"> · {logTooltip.entry.date}</span>
        </div>,
        document.body,
      )}

      {/* Vertical spine — same gradient as Changelog */}
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{
          left: SPINE_X,
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(52,211,153,0.14) 8%, rgba(52,211,153,0.14) 92%, transparent 100%)',
        }}
      />

      {/* ── [ACTIVITY] ──────────────────────────────────────────────────────── */}
      <div className={ROW} style={{ paddingLeft: CONTENT_LEFT }}>
        <SpineNode />

        <div className="mb-3 flex flex-wrap items-baseline gap-2">
          <Tag>[ACTIVITY]</Tag>
          <Sep />
          <span className="font-mono text-sm text-neutral-200">
            {totalCommits.toLocaleString()} commits
          </span>
          <span className="font-mono text-[11px] text-white/25">// last {activityLog.length} days</span>
        </div>

        {/* Render activityLog as horizontal bar chart */}
        <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-[1px]">
          {activityLog.map((entry, i) => (
            <div
              key={i}
              className="h-full grow cursor-default"
              style={{ 
                backgroundColor: `rgba(52,211,153,${LOG_OPACITIES[entry.level]})` 
              }}
              onMouseEnter={(e) => {
                // Anchor to the bar element itself, not the cursor position.
                // getBoundingClientRect() returns viewport-relative coords that
                // are unaffected by subsequent scroll or layout shifts.
                const rect = e.currentTarget.getBoundingClientRect()
                setLogTooltip({
                  entry,
                  x: rect.left + rect.width / 2, // horizontal center of bar
                  y: rect.top,                    // top edge of bar
                })
              }}
              onMouseLeave={() => setLogTooltip(null)}
            />
          ))}
        </div>
      </div>

      {/* ── [COMM] ──────────────────────────────────────────────────────────── */}
      <div className={ROW} style={{ paddingLeft: CONTENT_LEFT }}>
        <SpineNode />
        <div className="flex flex-wrap items-center gap-2.5">
          <Tag>[COMM]</Tag>
          <Sep />
          <span className="font-mono text-[12px] text-white/35">Discord:</span>
          <span className="font-mono text-sm text-neutral-200">{discord}</span>
          <button
            onClick={copyDiscord}
            className="cursor-pointer rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-widest transition-all duration-200"
            style={{
              color: copied ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.35)',
              borderColor: copied ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.10)',
            }}
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* ── [TIME] ──────────────────────────────────────────────────────────── */}
      <div className={ROW} style={{ paddingLeft: CONTENT_LEFT }}>
        <SpineNode />
        <div className="flex flex-wrap items-center gap-2.5">
          <Tag>[TIME]</Tag>
          <Sep />
          <span className="font-mono text-[12px] text-white/35">Local Time:</span>
          <span className="font-mono text-sm tabular-nums text-neutral-200">{time}</span>
          <span className="font-mono text-[11px] text-white/25">(HKT)</span>
        </div>
      </div>

      {/* ── [STAT] ──────────────────────────────────────────────────────────── */}
      <div className={ROW} style={{ paddingLeft: CONTENT_LEFT }}>
        <SpineNode />
        <div className="flex flex-wrap items-center gap-2.5">
          <Tag>[STAT]</Tag>
          <Sep />
          <span className="font-mono text-[12px] text-white/35">Status:</span>
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-sm text-emerald-400">Online</span>
          <span className="font-mono text-[11px] text-white/20">/</span>
          <span className="font-mono text-[12px] text-white/45">Available for Collaboration</span>
        </div>
      </div>

      {/* ── [MAIL] ──────────────────────────────────────────────────────────── */}
      <div className={ROW} style={{ paddingLeft: CONTENT_LEFT }}>
        <SpineNode />
        <div className="flex flex-wrap items-center gap-2.5">
          <Tag>[MAIL]</Tag>
          <Sep />
          <span className="font-mono text-[12px] text-white/35">Direct Connect:</span>
          <span className="select-all font-mono text-sm text-neutral-200">{email}</span>
        </div>
      </div>
    </div>
  )
}