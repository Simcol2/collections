'use client'

import { useCallback, useEffect, useState } from 'react'
import { getBookmarks, addBookmark, removeBookmark } from '@/lib/firebase'
import type { BookmarkItem } from '@/types'

export function useBookmarks(memberId: string | null, bookId: string) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!memberId) { setLoaded(true); return }
    const load = async () => {
      try {
        const data = await getBookmarks(memberId, bookId)
        setBookmarks(data.map(d => ({ id: d.id!, cfi: d.cfi, label: d.label, createdAt: d.createdAt })))
      } catch {
        // Firebase unavailable
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [memberId, bookId])

  const add = useCallback(async (cfi: string, label: string) => {
    const local: BookmarkItem = { id: `local-${Date.now()}`, cfi, label }
    if (!memberId) {
      setBookmarks(prev => [...prev, local])
      return
    }
    try {
      const id = await addBookmark(memberId, bookId, { cfi, label })
      setBookmarks(prev => [...prev, { id, cfi, label }])
    } catch { /* ok */ }
  }, [memberId, bookId])

  const remove = useCallback(async (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    if (!memberId) return
    try {
      await removeBookmark(memberId, bookId, bookmarkId)
    } catch { /* ok */ }
  }, [memberId, bookId])

  return { bookmarks, loaded, add, remove }
}
