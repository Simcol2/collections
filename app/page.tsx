import CollectionsNavbar from '@/components/layout/CollectionsNavbar'
import Bookshelf from '@/components/shelf/Bookshelf'

export default function HomePage() {
  return (
    <>
      <CollectionsNavbar />
      <main
        className="min-h-screen transition-theme"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        {/* Hero tagline */}
        <div
          className="pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <div
            className="border-l-2 pl-5 py-2 mt-8"
            style={{ borderColor: 'var(--accent-gold)' }}
          >
            <p
              className="text-sm italic"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              &ldquo;A collection that speaks before you do.&rdquo;
            </p>
          </div>
        </div>

        {/* The bookshelf */}
        <Bookshelf />

        {/* Footer */}
        <footer
          className="border-t mt-24 py-10 px-4 sm:px-6 text-center transition-theme"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
          >
            &copy; {new Date().getFullYear()} The Collections &mdash; All rights reserved
          </p>
          <p
            className="mt-2 text-xs italic"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}
          >
            Reading synced via Firebase &middot; Secured by Memberstack
          </p>
        </footer>
      </main>
    </>
  )
}
