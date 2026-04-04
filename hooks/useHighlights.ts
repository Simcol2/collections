'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getHighlights,
  addHighlight,
  removeHighlight,
} from '@/lib/firebase'
import type { Highlight } from '@/types'

// Gold and coral highlight fill colors (semi-transparent for epub iframe)
export const HIGHLIGHT_COLORS = {
  gold:  '#C9A84C55',
  coral: '#D94F3D44',
} as const

export function useHighlights(memberId: string | null, bookId: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loaded, setLoaded] = useState(false)
  // Track which CFI ranges are already rendered to avoid duplicates on re-render
  const renderedCfis = useRef<Set<string>>(new Set())

  // Load highlights from Firebase on mount
  useEffect(() => {
    if (!memberId) return
    const load = async () => {
      try {
        const data = await getHighlights(memberId, bookId)
        setHighlights(data)
      } catch {
        // Firebase unavailable — highlights work without sync
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [memberId, bookId])

  // Add a highlight — writes to Firebase, updates local state immediately
  const add = useCallback(
    async (cfiRange: string, text: string, color: Highlight['color'] = 'gold', locationLabel?: string) => {
      const newHighlight: Highlight = {
        id: memberId ? undefined : `local-${Date.now()}`,
        cfiRange, text, color, locationLabel,
      }
      if (!memberId) {
        newHighlight.id = `local-${Date.now()}`
        setHighlights(prev => [...prev, newHighlight as Highlight & { id: string }])
        return newHighlight as Highlight & { id: string }
      }
      try {
        const id = await addHighlight(memberId, bookId, { cfiRange, text, color, locationLabel })
        const saved: Highlight = { id, cfiRange, text, color, locationLabel }
        setHighlights(prev => [...prev, saved])
        return saved
      } catch {
        return undefined
      }
    },
    [memberId, bookId]
  )

  // Remove a highlight — deletes from Firebase, updates local state
  const remove = useCallback(
    async (highlightId: string, cfiRange: string) => {
      if (!memberId) return
      await removeHighlight(memberId, bookId, highlightId)
      setHighlights(prev => prev.filter(h => h.id !== highlightId))
      renderedCfis.current.delete(cfiRange)
    },
    [memberId, bookId]
  )

  // Apply all loaded highlights to an Epub.js rendition
  // Must be called inside rendition.on('rendered') to avoid timing issues
  const applyToRendition = useCallback(
    (rendition: unknown) => {
      const r = rendition as {
        annotations: {
          highlight: (
            cfi: string,
            data: Record<string, unknown>,
            cb: (e: MouseEvent) => void,
            className: string,
            styles: Record<string, string>
          ) => void
        }
      }
      highlights.forEach(h => {
        if (renderedCfis.current.has(h.cfiRange)) return
        try {
          r.annotations.highlight(
            h.cfiRange,
            {},
            () => {},
            'collections-highlight',
            { fill: HIGHLIGHT_COLORS[h.color], 'fill-opacity': '1' }
          )
          renderedCfis.current.add(h.cfiRange)
        } catch {
          // CFI may not be on this page — silently skip
        }
      })
    },
    [highlights]
  )

  return { highlights, loaded, add, remove, applyToRendition }
}
