'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getReadingProgress, saveReadingProgress, initBookRecord } from '@/lib/firebase'
import type { ReadingProgress } from '@/types'

const DEBOUNCE_MS = 2000

export function useReadingProgress(memberId: string | null, bookId: string) {
  const [progress, setProgress] = useState<ReadingProgress>({
    currentCfi: null,
    percentageCompleted: 0,
  })
  const [loaded, setLoaded] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load progress from Firebase on mount
  useEffect(() => {
    if (!memberId) return
    const load = async () => {
      await initBookRecord(memberId, bookId)
      const data = await getReadingProgress(memberId, bookId)
      if (data) {
        setProgress({
          currentCfi: data.currentCfi ?? null,
          percentageCompleted: data.percentageCompleted ?? 0,
        })
      }
      setLoaded(true)
    }
    load()
  }, [memberId, bookId])

  // Debounced save — called on every Epub.js 'relocated' event
  const onRelocated = useCallback(
    (cfi: string, percentage: number) => {
      setProgress({ currentCfi: cfi, percentageCompleted: percentage })

      if (!memberId) return
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        saveReadingProgress(memberId, bookId, {
          currentCfi: cfi,
          percentageCompleted: Math.round(percentage),
        })
      }, DEBOUNCE_MS)
    },
    [memberId, bookId]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  return { progress, loaded, onRelocated }
}
