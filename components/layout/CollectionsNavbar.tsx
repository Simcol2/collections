'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Moon, User, Menu, X, BookOpen } from 'lucide-react'
import { useMember, useMemberstackModal, useAuth } from '@memberstack/react'
import { useTheme } from '@/components/providers/ThemeProvider'

const NAV_TABS = [
  { label: 'The Collections', href: '/' },
  { label: 'My Books', href: '/my-books' },
  { label: 'The Long-Tale Diaries', href: '/diaries' },
]

export default function CollectionsNavbar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const { openModal } = useMemberstackModal()
  const { member } = useMember()
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleAuthAction = () => {
    if (member) {
      signOut()
    } else {
      openModal({ type: 'LOGIN' })
    }
    setMobileOpen(false)
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-theme"
        style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Wordmark */}
            <Link href="/" className="flex items-center gap-2 group" style={{ color: 'var(--text-primary)' }}>
              <BookOpen
                size={18}
                style={{ color: 'var(--accent-gold)' }}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-lg tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                The <span style={{ color: 'var(--accent-gold)' }}>Collections</span>
              </span>
            </Link>

            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_TABS.map(tab => {
                const isActive = pathname === tab.href
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="relative px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-200"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    }}
                  >
                    {tab.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-4 right-4 h-px rounded-full"
                        style={{ backgroundColor: 'var(--accent-gold)' }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className="p-2 rounded-full transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <button
                onClick={handleAuthAction}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest rounded-full border transition-all duration-200"
                style={{
                  borderColor: 'var(--accent-gold)',
                  color: member ? 'var(--text-primary)' : 'var(--accent-gold)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <User size={13} />
                {member ? 'Sign Out' : 'Sign In'}
              </button>

              <button
                className="md:hidden p-2"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle menu"
                style={{ color: 'var(--text-primary)' }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 py-4 flex flex-col gap-1"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            {NAV_TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 text-xs uppercase tracking-widest rounded-lg"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: pathname === tab.href ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  backgroundColor: pathname === tab.href ? 'var(--bg-elevated)' : 'transparent',
                }}
              >
                {tab.label}
              </Link>
            ))}
            <button
              onClick={handleAuthAction}
              className="mt-2 px-3 py-3 text-xs uppercase tracking-widest rounded-lg text-left"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-gold)' }}
            >
              {member ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        )}
      </nav>

      <div className="h-16" />
    </>
  )
}
