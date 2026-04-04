// ─── Book Metadata ────────────────────────────────────────────────────────────

export interface BookMeta {
  id: string
  title: string
  subtitle?: string
  author?: string
  spineColor: string          // CSS color for the spine block
  titleColor: string          // CSS color for spine text
  accentColor?: string        // Optional accent (e.g. border on hover)
  planId: string | null       // Memberstack plan ID — null = coming soon
  priceId?: string            // Memberstack price ID for checkout
  epubPath?: string           // Path to .epub in Firebase Storage
  coverImage?: string         // Path to cover art image
  isAvailable: boolean        // false = renders as placeholder / coming soon
  isSubstack?: boolean        // true = links to /diaries instead of reader
  description?: string
  tagline?: string
}

// ─── Reading Progress ─────────────────────────────────────────────────────────

export interface ReadingProgress {
  currentCfi: string | null
  percentageCompleted: number
  lastReadAt?: unknown
}

// ─── Highlight ────────────────────────────────────────────────────────────────

export interface Highlight {
  id?: string
  cfiRange: string
  text: string
  color: 'gold' | 'coral'
  locationLabel?: string   // e.g. "Ch. 3 · 42%"
  note?: string
  createdAt?: unknown
}

// ─── Memberstack Member ───────────────────────────────────────────────────────

export interface MemberstackMember {
  id: string
  auth: {
    email: string
  }
  planConnections: Array<{
    planId: string
    status: string
    payment?: {
      amount: number
      currency: string
    }
  }>
  metaData?: Record<string, string>
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark'
