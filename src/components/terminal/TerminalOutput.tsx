import type { Line } from '@/lib/terminal/types'

type TerminalOutputProps = {
  lines: Line[]
}

export default function TerminalOutput({ lines }: TerminalOutputProps) {
  return (
    <>
      {lines.map((line) => {
        if (line.kind === 'cmd') {
          return (
            <p key={line.id}>
              <span className="text-[#61afef]">$</span>
              <span className="ml-2 text-[#98c379]">{line.text}</span>
            </p>
          )
        }

        if (line.kind === 'out') {
          return (
            <p key={line.id} className="pl-2 text-white/55">
              {line.text}
            </p>
          )
        }

        if (line.kind === 'success') {
          return (
            <p key={line.id}>
              <span className="text-[#98c379]">✓</span>
              <span className="ml-2 text-[#98c379]">{line.text}</span>
            </p>
          )
        }

        if (line.kind === 'info') {
          return (
            <p key={line.id}>
              <span className="text-[#56b6c2]">›</span>
              <span className="ml-2 text-[#56b6c2]">{line.text}</span>
            </p>
          )
        }

        if (line.kind === 'warn') {
          return (
            <p key={line.id}>
              <span className="text-[#e5c07b]">⚠</span>
              <span className="ml-2 text-[#e5c07b]">{line.text}</span>
            </p>
          )
        }

        if (line.kind === 'err') {
          return (
            <p key={line.id}>
              <span className="text-[#e06c75]">✗</span>
              <span className="ml-2 text-[#e06c75]/80">{line.text}</span>
            </p>
          )
        }

        if (line.kind === 'link') {
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
        }

        return null
      })}
    </>
  )
}
