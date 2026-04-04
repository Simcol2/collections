'use client'

import { useEffect } from 'react'
import { X, Lock, Star } from 'lucide-react'
import { useMember, useMemberstackModal, useCheckout } from '@memberstack/react'
import type { BookMeta } from '@/types'

interface PurchaseModalProps {
  book: BookMeta
  onClose: () => void
}

export default function PurchaseModal({ book, onClose }: PurchaseModalProps) {
  const { openModal } = useMemberstackModal()
  const { member } = useMember()
  const checkout = useCheckout()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePurchase = async () => {
    if (!member) {
      // Open signup modal — user will sign up then come back to purchase
      openModal({ type: 'SIGNUP' })
      onClose()
      return
    }
    if (!book.priceId) return
    // Launch Stripe checkout via Memberstack
    await checkout({ priceId: book.priceId })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28,17,9,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 fade-up"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>

        {/* Book preview */}
        <div className="flex items-start gap-5 mb-6">
          <div
            className="flex-shrink-0 rounded-sm flex items-center justify-center"
            style={{
              width: '48px',
              height: '72px',
              backgroundColor: book.spineColor,
              boxShadow: '4px 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Lock size={14} style={{ color: book.titleColor, opacity: 0.7 }} />
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
            >
              {member ? 'Unlock now' : 'Create an account to purchase'}
            </p>
            <h2
              className="text-xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {book.title}
            </h2>
            {book.tagline && (
              <p
                className="mt-1 text-sm italic"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}
              >
                {book.tagline}
              </p>
            )}
          </div>
        </div>

        {book.description && (
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-reading)' }}
          >
            {book.description}
          </p>
        )}

        <ul className="mb-6 space-y-2">
          {[
            'Cloud-synced progress across all your devices',
            'Gold & coral text highlighting',
            'Favorite Quotes collection',
            'Lifetime access — buy once, read forever',
          ].map(item => (
            <li
              key={item}
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            >
              <Star size={11} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={handlePurchase}
          className="w-full py-3 rounded-full text-sm uppercase tracking-widest font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--accent-gold)',
            color: '#2B1A0F',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {member ? 'Purchase Access' : 'Sign Up & Purchase'}
        </button>

        {member && (
          <p
            className="mt-3 text-center text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
          >
            Signed in as {member.auth.email}
          </p>
        )}
      </div>
    </div>
  )
}
