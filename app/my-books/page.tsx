'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMember, useAuth } from '@memberstack/react'
import { BookOpen, Lock } from 'lucide-react'
import CollectionsNavbar from '@/components/layout/CollectionsNavbar'
import { BOOKS, hasAnyAccess } from '@/lib/books'
import { getReadingProgress } from '@/lib/firebase'
import type { BookMeta, ReadingProgress } from '@/types'

export default function MyBooksPage() {
  const router = useRouter()
  const { member } = useMember()
  const { status } = useAuth()
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({})

  const isLoading = status === 'LOADING'
  const planConnections = member?.planConnections ?? []
  const ownedBooks = BOOKS.filter(b => !b.isSubstack && hasAnyAccess(planConnections, b))

  useEffect(() => {
    if (!member || ownedBooks.length === 0) return
    const fetchAll = async () => {
      const entries = await Promise.all(
        ownedBooks.map(async book => {
          const progress = await getReadingProgress(member.id, book.id)
          return [
            book.id,
            (progress as ReadingProgress | null) ?? { currentCfi: null, percentageCompleted: 0 },
          ] as const
        })
      )
      setProgressMap(Object.fromEntries(entries))
    }
    fetchAll()
  }, [member?.id, ownedBooks.length])

  if (isLoading) {
    return (
      <>
        <CollectionsNavbar />
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-sm"
                style={{ width: '52px', height: '200px', backgroundColor: 'var(--bg-elevated)' }}
              />
            ))}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <CollectionsNavbar />
      <main className="min-h-screen transition-theme" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-sans)' }}
            >
              Your Library
            </p>
            <h1
              className="text-4xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              My Books
            </h1>
          </div>

          {/* Not signed in */}
          {!member && (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              <Lock size={32} style={{ color: 'var(--accent-gold)', margin: '0 auto 16px' }} />
              <p className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Sign in to view your books
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-full text-sm uppercase tracking-widest"
                style={{ backgroundColor: 'var(--accent-gold)', color: '#2B1A0F', fontFamily: 'var(--font-sans)' }}
              >
                Browse the shelf
              </Link>
            </div>
          )}

          {/* Signed in, no books */}
          {member && ownedBooks.length === 0 && (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              <BookOpen size={32} style={{ color: 'var(--accent-gold)', margin: '0 auto 16px' }} />
              <p className="text-lg mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Your shelf is empty
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                Head to the storefront to find your first collection.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-full text-sm uppercase tracking-widest"
                style={{ backgroundColor: 'var(--accent-gold)', color: '#2B1A0F', fontFamily: 'var(--font-sans)' }}
              >
                Browse the shelf
              </Link>
            </div>
          )}

          {/* Owned books grid */}
          {member && ownedBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedBooks.map(book => {
                const pct = progressMap[book.id]?.percentageCompleted ?? 0
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    percentage={pct}
                    onOpen={() => router.push(`/reader/${book.id}`)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function BookCard({ book, percentage, onOpen }: { book: BookMeta; percentage: number; onOpen: () => void }) {
  return (
    <div
      className="rounded-2xl overflow-hidden hover:-translate-y-1 cursor-pointer fade-up transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}
      onClick={onOpen}
    >
      {/* Cover art */}
      <div
        className="h-52 flex items-center justify-center"
        style={{
          backgroundColor: book.spineColor,
          backgroundImage: book.coverImage ? `url(${book.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!book.coverImage && (
          <span
            className="text-center px-6 text-xl leading-snug"
            style={{ color: book.titleColor, fontFamily: 'var(--font-display)' }}
          >
            {book.title}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg leading-tight mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
            {book.author}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Progress</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-sans)' }}>
              {percentage}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${percentage}%`, backgroundColor: 'var(--accent-gold)' }}
            />
          </div>
        </div>

        <button
          className="w-full py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold"
          style={{ backgroundColor: 'var(--accent-gold)', color: '#2B1A0F', fontFamily: 'var(--font-sans)' }}
        >
          {percentage > 0 ? 'Continue Reading' : 'Start Reading'}
        </button>
      </div>
    </div>
  )
}
