'use client'

import { useEffect } from 'react'
import { X, Trash2, ArrowRight, Quote } from 'lucide-react'
import type { Highlight } from '@/types'

interface FavoriteQuotesProps {
  highlights: Highlight[]
  onClose: () => void
  onJumpTo: (cfiRange: string) => void
  onRemove: (id: string, cfiRange: string) => void
}

export default function FavoriteQuotes({
  highlights,
  onClose,
  onJumpTo,
  onRemove,
}: FavoriteQuotesProps) {
  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const colorLabel = (color: Highlight['color']) =>
    color === 'gold' ? '#C9A84C' : '#D94F3D'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(28,17,9,0.4)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Drawer — full screen on mobile, side panel on desktop */}
      <aside
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl md:rounded-none md:top-0 md:right-0 md:left-auto md:w-96 drawer-slide"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-color)',
          borderTop: '1px solid var(--border-color)',
          maxHeight: '85vh',
          height: '85vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <Quote size={16} style={{ color: 'var(--accent-gold)' }} />
            <h2
              className="text-base font-display"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Favorite Quotes
            </h2>
            {highlights.length > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#2B1A0F',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {highlights.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quotes list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {highlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-12">
              <Quote size={32} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
              <p
                className="text-sm italic"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-muted)' }}
              >
                No highlights yet. Select text while reading to save a quote.
              </p>
            </div>
          ) : (
            highlights.map(h => (
              <div
                key={h.id}
                className="rounded-xl p-4 transition-theme"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderLeft: `3px solid ${colorLabel(h.color)}`,
                }}
              >
                {/* Quote text */}
                <p
                  className="text-sm leading-relaxed mb-3 italic"
                  style={{
                    fontFamily: 'var(--font-reading)',
                    color: 'var(--text-primary)',
                  }}
                >
                  &ldquo;{h.text}&rdquo;
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full self-start"
                      style={{
                        backgroundColor: colorLabel(h.color) + '22',
                        color: colorLabel(h.color),
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {h.color}
                    </span>
                    {h.locationLabel && (
                      <span
                        className="text-xs px-2"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                      >
                        {h.locationLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Jump to location */}
                    <button
                      onClick={() => { onJumpTo(h.cfiRange); onClose() }}
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: 'var(--accent-gold)' }}
                      title="Jump to this passage"
                    >
                      <ArrowRight size={15} />
                    </button>

                    {/* Remove highlight */}
                    <button
                      onClick={() => h.id && onRemove(h.id, h.cfiRange)}
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: 'var(--accent-coral)' }}
                      title="Remove highlight"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
