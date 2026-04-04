'use client'

interface ProgressBarProps {
  percentage: number
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(percentage)))

  return (
    <div className="flex items-center gap-3">
      {/* Bar */}
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: 'var(--accent-gold)' }}
        />
      </div>
      {/* Label */}
      <span
        className="text-xs tabular-nums flex-shrink-0"
        style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-sans)', minWidth: '32px' }}
      >
        {pct}%
      </span>
    </div>
  )
}
