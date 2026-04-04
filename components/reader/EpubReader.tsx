'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Highlighter } from 'lucide-react'
import { useHighlights, HIGHLIGHT_COLORS } from '@/hooks/useHighlights'
import type { Highlight } from '@/types'

interface EpubReaderProps {
  epubUrl: string
  memberId: string
  bookId: string
  initialCfi: string | null
  onRelocated: (cfi: string, percentage: number) => void
}

// Highlight color picker shown on text selection
interface SelectionMenuProps {
  x: number
  y: number
  onPick: (color: Highlight['color']) => void
  onDismiss: () => void
}

function SelectionMenu({ x, y, onPick, onDismiss }: SelectionMenuProps) {
  return (
    <div
      className="fixed z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl"
      style={{
        left: x,
        top: y - 56,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        transform: 'translateX(-50%)',
      }}
    >
      <Highlighter size={13} style={{ color: 'var(--text-muted)' }} />
      <button
        onClick={() => onPick('gold')}
        className="w-5 h-5 rounded-full border-2 border-white/30 hover:scale-110 transition-transform"
        style={{ backgroundColor: '#C9A84C' }}
        title="Gold highlight"
      />
      <button
        onClick={() => onPick('coral')}
        className="w-5 h-5 rounded-full border-2 border-white/30 hover:scale-110 transition-transform"
        style={{ backgroundColor: '#D94F3D' }}
        title="Coral highlight"
      />
      <button
        onClick={onDismiss}
        className="text-xs px-2 py-0.5 rounded"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
      >
        Cancel
      </button>
    </div>
  )
}

export default function EpubReader({
  epubUrl,
  memberId,
  bookId,
  initialCfi,
  onRelocated,
}: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Store rendition and book in refs — never in state (avoid re-render lifecycle issues)
  const renditionRef = useRef<unknown>(null)
  const bookRef = useRef<unknown>(null)
  const initialCfiApplied = useRef(false)

  const [ready, setReady] = useState(false)
  const [selection, setSelection] = useState<{
    x: number; y: number; cfiRange: string; text: string
  } | null>(null)

  const { highlights, loaded: highlightsLoaded, add, applyToRendition } = useHighlights(
    memberId,
    bookId
  )

  // ── Initialize Epub.js once on mount ───────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    const init = async () => {
      // Dynamic import — Epub.js is browser-only
      const ePub = (await import('epubjs')).default

      const book = ePub(epubUrl)
      bookRef.current = book

      const rendition = book.renderTo(containerRef.current!, {
        width: '100%',
        height: '100%',
        allowScriptedContent: false,
        spread: 'none',
      })
      renditionRef.current = rendition

      // ── Apply highlights after each section renders ─────────────────────
      rendition.on('rendered', () => {
        if (highlightsLoaded) applyToRendition(rendition)
      })

      // ── Save progress on page turn ──────────────────────────────────────
      rendition.on('relocated', (location: {
        start: { cfi: string; percentage?: number }
        end: { cfi: string }
      }) => {
        const cfi = location.start.cfi
        const pct = (location.start.percentage ?? 0) * 100
        onRelocated(cfi, pct)
      })

      // ── Text selection → show highlight menu ───────────────────────────
      rendition.on('selected', (cfiRange: string, contents: {
        window: Window
        document: Document
      }) => {
        const sel = contents.window.getSelection()
        if (!sel || sel.isCollapsed) return
        const text = sel.toString().trim()
        if (!text) return

        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const iframe = containerRef.current?.querySelector('iframe')
        const iframeRect = iframe?.getBoundingClientRect()

        const x = (iframeRect?.left ?? 0) + rect.left + rect.width / 2
        const y = (iframeRect?.top ?? 0) + rect.top

        setSelection({ x, y, cfiRange, text })
      })

      // ── Display initial CFI or start of book ───────────────────────────
      if (initialCfi && !initialCfiApplied.current) {
        initialCfiApplied.current = true
        await rendition.display(initialCfi)
      } else {
        await rendition.display()
      }

      if (!destroyed) setReady(true)
    }

    init()

    return () => {
      destroyed = true
      // Clean up Epub.js instances on unmount
      if (renditionRef.current) {
        try { (renditionRef.current as { destroy: () => void }).destroy() } catch { /* ok */ }
      }
      if (bookRef.current) {
        try { (bookRef.current as { destroy: () => void }).destroy() } catch { /* ok */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epubUrl]) // Only re-init if the book URL changes

  // ── Re-apply highlights when they finish loading from Firebase ─────────────
  useEffect(() => {
    if (highlightsLoaded && renditionRef.current) {
      applyToRendition(renditionRef.current)
    }
  }, [highlightsLoaded, highlights, applyToRendition])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevPage = useCallback(() => {
    (renditionRef.current as { prev: () => void } | null)?.prev()
  }, [])

  const nextPage = useCallback(() => {
    (renditionRef.current as { next: () => void } | null)?.next()
  }, [])

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prevPage()
      if (e.key === 'ArrowRight') nextPage()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevPage, nextPage])

  // ── Highlight selection handler ────────────────────────────────────────────
  const handleHighlight = async (color: Highlight['color']) => {
    if (!selection) return
    const { cfiRange, text } = selection

    const newHighlight = await add(cfiRange, text, color)
    if (newHighlight && renditionRef.current) {
      try {
        (renditionRef.current as {
          annotations: {
            highlight: (
              cfi: string,
              data: Record<string, unknown>,
              cb: () => void,
              cls: string,
              styles: Record<string, string>
            ) => void
          }
        }).annotations.highlight(
          cfiRange, {}, () => {}, 'collections-highlight',
          { fill: HIGHLIGHT_COLORS[color], 'fill-opacity': '1' }
        )
      } catch { /* ok */ }
    }
    setSelection(null)
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Loading overlay */}
      {!ready && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Epub.js render target */}
      <div
        ref={containerRef}
        className="flex-1 epub-container"
        style={{ minHeight: 0 }}
      />

      {/* Page navigation — tap zones on mobile, buttons on desktop */}
      <button
        onClick={prevPage}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-3 opacity-0 hover:opacity-100 transition-opacity md:opacity-40 md:hover:opacity-100"
        aria-label="Previous page"
        style={{ color: 'var(--accent-gold)' }}
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextPage}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-3 opacity-0 hover:opacity-100 transition-opacity md:opacity-40 md:hover:opacity-100"
        aria-label="Next page"
        style={{ color: 'var(--accent-gold)' }}
      >
        <ChevronRight size={28} />
      </button>

      {/* Mobile tap zones (left/right 25% of screen) */}
      <div
        className="md:hidden absolute left-0 top-0 w-1/4 h-full cursor-pointer"
        onClick={prevPage}
      />
      <div
        className="md:hidden absolute right-0 top-0 w-1/4 h-full cursor-pointer"
        onClick={nextPage}
      />

      {/* Highlight color picker */}
      {selection && (
        <SelectionMenu
          x={selection.x}
          y={selection.y}
          onPick={handleHighlight}
          onDismiss={() => setSelection(null)}
        />
      )}
    </div>
  )
}
