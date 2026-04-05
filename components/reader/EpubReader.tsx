'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Highlighter, X, Maximize, Minimize, List, Bookmark, BookmarkCheck } from 'lucide-react'
import { HIGHLIGHT_COLORS } from '@/hooks/useHighlights'
import type { Highlight, BookmarkItem } from '@/types'

interface TocItem {
  label: string
  href: string
  subitems?: TocItem[]
}

interface EpubReaderProps {
  epubUrl: string
  initialCfi: string | null
  onRelocated: (cfi: string, percentage: number) => void
  highlights: Highlight[]
  highlightsLoaded: boolean
  onAddHighlight: (cfiRange: string, text: string, color: Highlight['color'], locationLabel: string) => Promise<Highlight | undefined>
  onRemoveHighlight: (id: string, cfiRange: string) => void
  applyToRendition: (rendition: unknown) => void
  bookmarks: BookmarkItem[]
  onAddBookmark: (cfi: string, label: string) => void
  onRemoveBookmark: (id: string) => void
}

interface ActiveMenu {
  type: 'selection' | 'highlight'
  x: number
  y: number
  cfiRange: string
  text: string
  highlightId?: string
  highlightColor?: Highlight['color']
}

export default function EpubReader({
  epubUrl,
  initialCfi,
  onRelocated,
  highlights,
  highlightsLoaded,
  onAddHighlight,
  onRemoveHighlight,
  applyToRendition,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
}: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<unknown>(null)
  const bookRef = useRef<unknown>(null)
  const initialCfiApplied = useRef(false)
  const currentPctRef = useRef(0)
  const currentCfiRef = useRef('')
  const currentChapterRef = useRef('')

  const [ready, setReady] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('Loading…')
  const [pct, setPct] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeMenu, setActiveMenu] = useState<ActiveMenu | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [tocOpen, setTocOpen] = useState(false)

  // ── Fullscreen toggle ─────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(() => {
        setIsFullscreen(f => !f)
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // ── Initialize Epub.js once on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    const init = async () => {
      const ePub = (await import('epubjs')).default
      const book = ePub(epubUrl)
      bookRef.current = book

      const rendition = book.renderTo(containerRef.current!, {
        width: '100%',
        height: '100%',
        allowScriptedContent: true,
        spread: 'none',
        flow: 'paginated',
        minSpreadWidth: 9999,
      })
      renditionRef.current = rendition

      // ── White e-reader theme ─────────────────────────────────────────────
      rendition.themes.default({
        'html': {
          background: '#FFFFFF !important',
        },
        'body': {
          background: '#FFFFFF !important',
          color: '#1C1109 !important',
          fontFamily: '"Georgia", "Times New Roman", serif !important',
          fontSize: '20px !important',
          lineHeight: '1.8 !important',
          padding: '1.25rem 5% !important',
          margin: '0 !important',
          maxWidth: '100% !important',
          boxSizing: 'border-box !important',
          '-webkit-text-size-adjust': '100%',
        },
        'p': { marginBottom: '1em', textAlign: 'justify' },
        'h1, h2, h3': {
          fontFamily: '"Playfair Display", Georgia, serif !important',
          lineHeight: '1.3 !important',
          marginBottom: '0.75em !important',
        },
        'img': { maxWidth: '100% !important', height: 'auto !important' },
        '* ': { boxSizing: 'border-box !important' },
      })

      // ── Apply highlights after each section renders ───────────────────────
      rendition.on('rendered', () => {
        if (highlightsLoaded) applyToRendition(rendition)
      })

      // ── Track location for chapter title + % + page ──────────────────────
      rendition.on('relocated', async (location: {
        start: { cfi: string; percentage?: number }
      }) => {
        const cfi = location.start.cfi
        const percentage = (location.start.percentage ?? 0) * 100
        currentPctRef.current = percentage
        currentCfiRef.current = cfi
        setPct(Math.round(percentage))
        onRelocated(cfi, percentage)

        // Update page number from locations if generated
        try {
          const b = bookRef.current as {
            locations: { locationFromCfi: (cfi: string) => number; total: number }
          }
          if (b.locations?.total > 0) {
            setCurrentPage(b.locations.locationFromCfi(cfi) + 1)
          }
        } catch { /* ok */ }

        // Resolve chapter title from TOC
        try {
          const b = bookRef.current as {
            spine: { get: (cfi: string) => { href: string; index: number } | null }
            navigation: { toc: TocItem[] }
          }
          const spineItem = b.spine.get(cfi)
          if (spineItem) {
            const toc = b.navigation?.toc ?? []
            const allItems = toc.flatMap(t => [t, ...(t.subitems ?? [])])
            const match = allItems.find(t =>
              spineItem.href.includes(t.href.split('#')[0]) ||
              t.href.split('#')[0].includes(spineItem.href)
            )
            const label = match?.label?.trim() ?? `Section ${spineItem.index + 1}`
            currentChapterRef.current = label
            setChapterTitle(label)
          }
        } catch { /* ok */ }
      })

      // ── Text selection → show highlight menu ─────────────────────────────
      rendition.on('selected', (cfiRange: string, contents: { window: Window }) => {
        const sel = contents.window.getSelection()
        if (!sel || sel.isCollapsed) return
        const text = sel.toString().trim()
        if (!text) return

        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const iframe = containerRef.current?.querySelector('iframe')
        const iframeRect = iframe?.getBoundingClientRect()

        setActiveMenu({
          type: 'selection',
          x: (iframeRect?.left ?? 0) + rect.left + rect.width / 2,
          y: (iframeRect?.top ?? 0) + rect.top,
          cfiRange,
          text,
        })
      })

      // ── Display initial CFI or start ──────────────────────────────────────
      if (initialCfi && !initialCfiApplied.current) {
        initialCfiApplied.current = true
        await rendition.display(initialCfi)
      } else {
        await rendition.display()
      }

      // Force resize after display so Epub.js recalculates column widths
      setTimeout(() => {
        if (!destroyed) {
          try {
            (renditionRef.current as { resize: (w: string, h: string) => void })
              .resize('100%', '100%')
          } catch { /* ok */ }
        }
      }, 100)

      if (!destroyed) setReady(true)

      // ── Load TOC ─────────────────────────────────────────────────────────
      try {
        await book.ready
        const nav = (book as unknown as { navigation: { toc: TocItem[] } }).navigation
        if (nav?.toc) setTocItems(nav.toc)
      } catch { /* ok */ }

      // ── Generate locations for page numbers (async, non-blocking) ────────
      try {
        await book.ready
        const b = book as unknown as {
          locations: { generate: (chars: number) => Promise<string[]>; total: number }
        }
        await b.locations.generate(1650)
        if (!destroyed) setTotalPages(b.locations.total)
      } catch { /* ok */ }
    }

    init()

    // Resize rendition when container size changes
    const observer = new ResizeObserver(() => {
      if (renditionRef.current) {
        try {
          (renditionRef.current as { resize: (w: string, h: string) => void })
            .resize('100%', '100%')
        } catch { /* ok */ }
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      destroyed = true
      observer.disconnect()
      if (renditionRef.current) {
        try { (renditionRef.current as { destroy: () => void }).destroy() } catch { /* ok */ }
      }
      if (bookRef.current) {
        try { (bookRef.current as { destroy: () => void }).destroy() } catch { /* ok */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epubUrl])

  // ── Re-apply highlights + wire click handlers ────────────────────────────────
  useEffect(() => {
    if (!highlightsLoaded || !renditionRef.current) return
    const r = renditionRef.current as {
      annotations: {
        highlight: (cfi: string, data: Record<string, unknown>, cb: (e: MouseEvent) => void, cls: string, styles: Record<string, string>) => void
        remove: (cfi: string, type: string) => void
      }
    }
    highlights.forEach(h => {
      try { r.annotations.remove(h.cfiRange, 'highlight') } catch { /* ok */ }
      r.annotations.highlight(
        h.cfiRange,
        { id: h.id },
        (e: MouseEvent) => {
          e.preventDefault()
          const iframe = containerRef.current?.querySelector('iframe')
          const iframeRect = iframe?.getBoundingClientRect()
          setActiveMenu({
            type: 'highlight',
            x: (iframeRect?.left ?? 0) + e.clientX,
            y: (iframeRect?.top ?? 0) + e.clientY,
            cfiRange: h.cfiRange,
            text: h.text,
            highlightId: h.id,
            highlightColor: h.color,
          })
        },
        'collections-highlight',
        { fill: HIGHLIGHT_COLORS[h.color], 'fill-opacity': '1' }
      )
    })
  }, [highlights, highlightsLoaded, onRemoveHighlight])

  // ── Navigation ───────────────────────────────────────────────────────────────
  const prevPage = useCallback(() => {
    (renditionRef.current as { prev: () => void } | null)?.prev()
    setActiveMenu(null)
  }, [])

  const nextPage = useCallback(() => {
    (renditionRef.current as { next: () => void } | null)?.next()
    setActiveMenu(null)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prevPage()
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'Escape')     { setActiveMenu(null); setTocOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevPage, nextPage])

  // ── Highlight / remove handlers ──────────────────────────────────────────────
  const handleHighlight = async (color: Highlight['color']) => {
    if (!activeMenu || activeMenu.type !== 'selection') return
    const locationLabel = `${currentChapterRef.current ? currentChapterRef.current + ' · ' : ''}~${Math.round(currentPctRef.current)}%`
    await onAddHighlight(activeMenu.cfiRange, activeMenu.text, color, locationLabel)
    setActiveMenu(null)
  }

  const handleRemoveHighlight = () => {
    if (!activeMenu?.highlightId) return
    onRemoveHighlight(activeMenu.highlightId, activeMenu.cfiRange)
    setActiveMenu(null)
  }

  // ── Bookmark helpers ─────────────────────────────────────────────────────────
  const currentBookmark = bookmarks.find(b => b.cfi === currentCfiRef.current)
  const isBookmarked = !!currentBookmark

  const handleBookmark = useCallback(() => {
    if (isBookmarked && currentBookmark) {
      onRemoveBookmark(currentBookmark.id)
    } else {
      const label = `${currentChapterRef.current ? currentChapterRef.current + ' · ' : ''}${Math.round(currentPctRef.current)}%`
      onAddBookmark(currentCfiRef.current, label)
    }
  }, [isBookmarked, currentBookmark, onAddBookmark, onRemoveBookmark])

  // ── TOC navigation ───────────────────────────────────────────────────────────
  const handleTocJump = useCallback((href: string) => {
    try {
      (renditionRef.current as { display: (target: string) => void } | null)?.display(href)
    } catch { /* ok */ }
    setTocOpen(false)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: 'white' }}
      onClick={() => { setActiveMenu(null); setTocOpen(false) }}
    >
      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'white' }}>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--accent-gold)', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Chapter + % info bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between border-b"
        style={{
          backgroundColor: 'white',
          borderColor: '#e8e0d4',
          padding: '6px 16px',
          minHeight: '32px',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        {/* TOC button */}
        <button
          onClick={e => { e.stopPropagation(); setTocOpen(o => !o) }}
          style={{ color: '#9B8B72', marginRight: '8px', flexShrink: 0 }}
          aria-label="Table of contents"
          title="Table of contents"
        >
          <List size={14} />
        </button>

        <span
          className="truncate flex-1"
          style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: '#9B8B72', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          {chapterTitle}
        </span>

        {/* Bookmark button */}
        <button
          onClick={e => { e.stopPropagation(); handleBookmark() }}
          style={{ color: isBookmarked ? '#C9A84C' : '#9B8B72', marginLeft: '8px', flexShrink: 0 }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>

        <span style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: '#9B8B72', letterSpacing: '0.06em', flexShrink: 0, marginLeft: '8px' }}>
          {pct}%
        </span>
      </div>

      {/* Reader row: arrow | content | arrow */}
      <div className="flex-1 flex items-stretch min-h-0 relative">

        {/* Prev arrow */}
        <button
          onClick={prevPage}
          className="flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-100"
          style={{
            width: '52px',
            opacity: 0.45,
            backgroundColor: 'white',
            color: '#C9A84C',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Previous page"
        >
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>

        {/* Epub.js render target */}
        <div ref={containerRef} className="flex-1 min-w-0" style={{ backgroundColor: 'white', overflow: 'hidden' }} />

        {/* Next arrow + fullscreen */}
        <div className="flex-shrink-0 flex flex-col items-center justify-between" style={{ width: '52px', backgroundColor: 'white' }}>
          <button
            onClick={toggleFullscreen}
            className="p-2 transition-opacity hover:opacity-100"
            style={{ opacity: 0.35, color: '#9B8B72', marginTop: '8px' }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <button
            onClick={nextPage}
            className="flex items-center justify-center flex-1 transition-opacity hover:opacity-100"
            style={{
              width: '100%',
              opacity: 0.45,
              backgroundColor: 'white',
              color: '#C9A84C',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Next page"
          >
            <ChevronRight size={32} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Page number bar at bottom */}
      {ready && totalPages > 0 && (
        <div
          className="flex-shrink-0 flex items-center justify-center border-t"
          style={{
            backgroundColor: 'white',
            borderColor: '#e8e0d4',
            padding: '4px 16px',
            minHeight: '24px',
          }}
        >
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', color: '#C4B49A', letterSpacing: '0.08em' }}>
            {currentPage > 0 ? `${currentPage} / ${totalPages}` : `— / ${totalPages}`}
          </span>
        </div>
      )}

      {/* Mobile tap zones */}
      <div className="md:hidden absolute left-14 top-8 w-1/3 h-full cursor-pointer z-5" onClick={prevPage} />
      <div className="md:hidden absolute right-14 top-8 w-1/3 h-full cursor-pointer z-5" onClick={nextPage} />

      {/* TOC panel */}
      {tocOpen && (
        <div
          className="absolute top-8 left-14 z-40 rounded-xl shadow-2xl overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            maxHeight: '70%',
            width: '260px',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Contents
            </span>
            <button onClick={() => setTocOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          </div>
          <div className="py-2">
            {tocItems.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => handleTocJump(item.href)}
                  className="w-full text-left px-4 py-2 hover:opacity-70 transition-opacity"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--text-primary)' }}
                >
                  {item.label}
                </button>
                {item.subitems?.map((sub, j) => (
                  <button
                    key={j}
                    onClick={() => handleTocJump(sub.href)}
                    className="w-full text-left px-8 py-1.5 hover:opacity-70 transition-opacity"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-muted)' }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection / highlight action menu */}
      {activeMenu && (
        <div
          className="fixed z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl"
          style={{
            left: Math.min(activeMenu.x, window.innerWidth - 180),
            top: activeMenu.y - 60,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {activeMenu.type === 'selection' ? (
            <>
              <Highlighter size={13} style={{ color: 'var(--text-muted)' }} />
              <button onClick={() => handleHighlight('gold')}
                className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                style={{ backgroundColor: '#C9A84C' }} title="Gold highlight" />
              <button onClick={() => handleHighlight('coral')}
                className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                style={{ backgroundColor: '#D94F3D' }} title="Coral highlight" />
              <button onClick={() => setActiveMenu(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '11px' }}>
                {activeMenu.highlightColor === 'gold' ? '● Gold' : '● Coral'}
              </span>
              <button
                onClick={handleRemoveHighlight}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ backgroundColor: '#D94F3D22', color: '#D94F3D', fontFamily: 'var(--font-sans)', fontSize: '11px' }}
              >
                Remove
              </button>
              <button onClick={() => setActiveMenu(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
