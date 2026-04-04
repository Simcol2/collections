import CollectionsNavbar from '@/components/layout/CollectionsNavbar'
import { Rss } from 'lucide-react'

export const metadata = {
  title: 'The Long-Tale Diaries | The Collections',
  description: 'The ongoing diaries. Subscribe to stay in the story.',
}

export default function DiariesPage() {
  return (
    <>
      <CollectionsNavbar />
      <main className="min-h-screen transition-theme" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#2B1A0F',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <Rss size={11} />
                Substack
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-display leading-tight mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              The Long-Tale Diaries
            </h1>
            <p
              className="text-lg italic leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
            >
              Read the diaries. Subscribe to the story.
            </p>
            <div
              className="mt-6 h-px"
              style={{ backgroundColor: 'var(--border-color)' }}
            />
          </div>

          {/* ── Substack embed goes here ──────────────────────────────────
              Paste your Substack embed code in the div below.
              It will look something like:
              <iframe src="https://yourname.substack.com/embed" ...></iframe>
              or their custom <script> embed snippet.
          ─────────────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            {/* REPLACE THIS PLACEHOLDER WITH YOUR SUBSTACK EMBED CODE */}
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
            >
              Newsletter Embed
            </p>
            <p
              className="text-base italic mb-6"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
            >
              Paste your Substack embed code here when ready.
            </p>
            <div
              className="inline-block px-1 py-1 rounded-lg text-xs"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
              }}
            >
              {'// app/diaries/page.tsx → replace placeholder below'}
            </div>
          </div>
          {/* ── End Substack embed ─────────────────────────────────────── */}

          {/* Back link */}
          <div className="mt-12 text-center">
            <a
              href="/"
              className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-sans)' }}
            >
              &larr; Back to The Collections
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
