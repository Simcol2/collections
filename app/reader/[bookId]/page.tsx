'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useMember, useAuth } from '@memberstack/react'
import { ArrowLeft, Quote, BookOpen } from 'lucide-react'
import Link from 'next/link'

import CollectionsNavbar from '@/components/layout/CollectionsNavbar'
import ProgressBar from '@/components/reader/ProgressBar'
import FavoriteQuotes from '@/components/reader/FavoriteQuotes'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useHighlights } from '@/hooks/useHighlights'
import { getBook, hasAnyAccess } from '@/lib/books'

// Epub.js is browser-only — must be dynamically imported with ssr: false
const EpubReader = dynamic(() => import('@/components/reader/EpubReader'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--accent-gold)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  ),
})

export default function ReaderPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.bookId as string
  const book = getBook(bookId)

  const { member } = useMember()
  const { status } = useAuth()
  const isLoading = status === 'LOADING'

  const [quotesOpen, setQuotesOpen] = useState(false)

  const memberId = member?.id ?? null
  const planConnections = member?.planConnections ?? []

  const { progress, loaded: progressLoaded, onRelocated } = useReadingProgress(memberId, bookId)
  const { highlights, loaded: highlightsLoaded, add, remove, applyToRendition } = useHighlights(memberId, bookId)

  // Jump reader to a CFI location (used from FavoriteQuotes)
  const [jumpCfi, setJumpCfi] = useState<string | null>(null)
  const handleJumpTo = useCallback((cfi: string) => {
    setJumpCfi(cfi)
  }, [])

  // ── Access checks ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--accent-gold)', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // Book not found
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Book not found.
          </p>
          <Link href="/" style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            ← Back to The Collections
          </Link>
        </div>
      </div>
    )
  }

  const isDev = process.env.NODE_ENV === 'development'

  // Not logged in or no access
  if (!isDev && (!member || !hasAnyAccess(planConnections, book))) {
    return (
      <>
        <CollectionsNavbar />
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
          <div
            className="rounded-2xl p-10 max-w-sm w-full text-center"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <BookOpen size={32} style={{ color: 'var(--accent-gold)', margin: '0 auto 16px' }} />
            <p className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Access required
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              You need to purchase {book.title} to read it.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-full text-sm uppercase tracking-widest"
              style={{ backgroundColor: 'var(--accent-gold)', color: '#2B1A0F', fontFamily: 'var(--font-sans)' }}
            >
              Go to shelf
            </Link>
          </div>
        </div>
      </>
    )
  }

  // No EPUB file configured yet
  if (!book.epubPath) {
    return (
      <>
        <CollectionsNavbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
            EPUB file not yet uploaded. Add the file path to lib/books.ts.
          </p>
        </div>
      </>
    )
  }

  // ── Reader UI ───────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col transition-theme"
      style={{ height: '100dvh', backgroundColor: 'var(--bg-base)', overflow: 'hidden' }}
    >
      {/* Top bar */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {/* Back */}
        <button
          onClick={() => router.push('/my-books')}
          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Back to My Books"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Title */}
        <h1
          className="flex-1 truncate text-sm"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {book.title}
        </h1>

        {/* Progress bar */}
        <div className="hidden sm:block w-36 flex-shrink-0">
          <ProgressBar percentage={progress.percentageCompleted} />
        </div>

        {/* Favorite Quotes toggle */}
        <button
          onClick={() => setQuotesOpen(true)}
          className="relative flex-shrink-0 p-2 rounded-full transition-colors"
          style={{ color: highlights.length > 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}
          aria-label="Favorite Quotes"
          title="Favorite Quotes"
        >
          <Quote size={18} />
          {highlights.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-gold)', color: '#2B1A0F', fontFamily: 'var(--font-sans)', fontSize: '9px' }}
            >
              {highlights.length}
            </span>
          )}
        </button>
      </header>

      {/* Mobile progress bar */}
      <div className="sm:hidden px-4 py-2 flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <ProgressBar percentage={progress.percentageCompleted} />
      </div>

      {/* Reader — fills remaining height, no extra padding (EpubReader owns its layout) */}
      <div className="flex-1 min-h-0 w-full">
        {progressLoaded && (
          <EpubReader
            epubUrl={book.epubPath!}
            initialCfi={jumpCfi ?? progress.currentCfi}
            onRelocated={onRelocated}
            highlights={highlights}
            highlightsLoaded={highlightsLoaded}
            onAddHighlight={add}
            onRemoveHighlight={remove}
            applyToRendition={applyToRendition}
          />
        )}
      </div>

      {/* Favorite Quotes drawer */}
      {quotesOpen && (
        <FavoriteQuotes
          highlights={highlights}
          onClose={() => setQuotesOpen(false)}
          onJumpTo={handleJumpTo}
          onRemove={remove}
        />
      )}
    </div>
  )
}
