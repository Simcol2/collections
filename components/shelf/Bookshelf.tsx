'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMember } from '@memberstack/react'
import BookSpine from './BookSpine'
import PurchaseModal from './PurchaseModal'
import { BOOKS, hasAnyAccess } from '@/lib/books'
import type { BookMeta } from '@/types'

export default function Bookshelf() {
  const router = useRouter()
  const { member } = useMember()
  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null)

  const planConnections = member?.planConnections ?? []

  const handleSpineClick = (book: BookMeta) => {
    if (!book.isAvailable) return
    if (book.isSubstack) {
      router.push('/diaries')
      return
    }
    if (hasAnyAccess(planConnections, book)) {
      router.push(`/reader/${book.id}`)
    } else {
      setSelectedBook(book)
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-12">
        <p
          className="text-xs uppercase tracking-[0.3em] mb-2"
          style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-sans)' }}
        >
          The Library
        </p>
        <h1
          className="text-4xl sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          The Collections
        </h1>
        <p
          className="mt-3 text-base italic"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
        >
          Click a spine to open. Click a locked title to purchase access.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Books row */}
        <div className="flex items-end gap-3 sm:gap-5 overflow-x-auto pb-1 min-h-[224px]">
          {BOOKS.map(book => (
            <BookSpine
              key={book.id}
              book={book}
              hasAccess={hasAnyAccess(planConnections, book)}
              onClick={() => handleSpineClick(book)}
            />
          ))}
          {/* Decorative gap filler */}
          <div
            style={{
              width: '10px',
              height: '150px',
              alignSelf: 'flex-end',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '1px 3px 3px 1px',
              opacity: 0.4,
              flexShrink: 0,
            }}
          />
        </div>

        {/* Gold shelf rail */}
        <div className="shelf-rail mt-0" />
        <div className="shelf-shadow" />
      </div>

      {/* Legend */}
      <div className="max-w-6xl mx-auto mt-10 flex flex-wrap gap-6">
        {[
          { dot: 'var(--accent-gold)', label: 'Owned / Access granted' },
          { dot: 'transparent', border: 'var(--border-color)', label: 'Available to purchase' },
          { dot: 'var(--bg-elevated)', label: 'Coming soon', opacity: 0.5 },
        ].map(({ dot, border, label, opacity }) => (
          <div key={label} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
            <span
              className="w-3 h-3 rounded-full inline-block border"
              style={{ backgroundColor: dot, borderColor: border ?? dot, opacity: opacity ?? 1 }}
            />
            {label}
          </div>
        ))}
      </div>

      {selectedBook && (
        <PurchaseModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </section>
  )
}
