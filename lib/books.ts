import type { BookMeta } from '@/types'

export const BOOKS: BookMeta[] = [
  {
    id: 'qassandra_collection',
    title: 'The Qassandra Collection',
    tagline: 'A collection that speaks before you do.',
    spineColor: '#2B1A0F',       // deep espresso (hair shadows from pillow)
    titleColor: '#C9A84C',       // brushed gold (sunglasses frame)
    accentColor: '#C9A84C',
    planId: 'pln_the-qassandra-collection-g02f0a00',
    priceId: 'prc_one-time-purchase-qassandra-5s400d3p',
    epubPath: '/epubs/the-cassandra-collection.epub',
    coverImage: '/covers/qassandra.jpg',
    isAvailable: true,
    description: 'The defining work of The Collections. A curated body of prose that holds its ground.',
  },
  {
    id: 'collection_of_s',
    title: 'The Collection of S',
    spineColor: '#7A5C3E',       // warm mahogany
    titleColor: '#F5EFE0',       // canvas cream
    accentColor: '#E8C4A0',
    planId: null,
    isAvailable: true,
    epubPath: '/epubs/s-the-collection.epub',
    tagline: 'Coming soon.',
  },
  {
    id: 'back_left_burner',
    title: 'Back Left Burner',
    subtitle: 'Digital Archive',
    spineColor: '#D94F3D',       // coral red (roses from pillow)
    titleColor: '#F5EFE0',
    accentColor: '#F5EFE0',
    planId: null,
    isAvailable: false,
    tagline: 'The archive. Coming soon.',
  },
  {
    id: 'long_tale_diaries',
    title: 'The Long-Tale Diaries',
    spineColor: '#C9A84C',       // full gold spine — the Substack entry
    titleColor: '#2B1A0F',
    accentColor: '#2B1A0F',
    planId: null,
    isAvailable: true,
    isSubstack: true,
    tagline: 'Read the diaries. Subscribe to the story.',
  },
]

export function getBook(id: string): BookMeta | undefined {
  return BOOKS.find(b => b.id === id)
}

export function getAvailableBooks(): BookMeta[] {
  return BOOKS.filter(b => b.isAvailable && !b.isSubstack)
}

export function hasPlanAccess(
  planConnections: Array<{ planId: string }>,
  book: BookMeta
): boolean {
  if (!book.planId) return false
  return planConnections.some(p => p.planId === book.planId)
}

// Also checks the complimentary access plan
export function hasAnyAccess(
  planConnections: Array<{ planId: string }>,
  book: BookMeta
): boolean {
  const COMP_PLAN = 'pln_complimentary-access-fzsa0exp'
  return hasPlanAccess(planConnections, book) ||
    planConnections.some(p => p.planId === COMP_PLAN)
}
