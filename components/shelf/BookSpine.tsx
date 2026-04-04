'use client'

import type { BookMeta } from '@/types'

interface BookSpineProps {
  book: BookMeta
  hasAccess: boolean
  onClick: () => void
}

export default function BookSpine({ book, hasAccess, onClick }: BookSpineProps) {
  const isComingSoon = !book.isAvailable
  const spineClass = [
    'book-spine',
    isComingSoon ? 'book-spine-coming-soon' : '',
  ].join(' ')

  return (
    <div className="flex flex-col items-center gap-0">
      {/* The spine itself */}
      <button
        onClick={isComingSoon ? undefined : onClick}
        className={spineClass}
        style={{
          width: '52px',
          height: '200px',
          backgroundColor: book.spineColor,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 6px',
        }}
        aria-label={book.title}
        disabled={isComingSoon}
      >
        {/* Spine highlight line (page edge illusion) */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: '2px 0 0 2px',
          }}
        />

        {/* Title text */}
        <span
          className="book-spine-title text-xs font-display"
          style={{
            color: book.titleColor,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '10px',
          }}
        >
          {book.title}
        </span>

        {/* Access indicator */}
        {hasAccess && !isComingSoon && (
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: book.titleColor,
              opacity: 0.8,
            }}
          />
        )}

        {/* Gold accent top edge */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '3px',
            right: 0,
            height: '2px',
            backgroundColor: book.accentColor ?? book.titleColor,
            opacity: 0.6,
          }}
        />
      </button>
    </div>
  )
}
