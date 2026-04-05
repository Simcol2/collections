import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  doc, getDoc, setDoc, deleteDoc,
  collection, addDoc, getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyCyohrg_5UZVhj98q1RMB3zvc1lWwdaFNo",
  authDomain: "back-left-burner.firebaseapp.com",
  projectId: "back-left-burner",
  storageBucket: "back-left-burner.firebasestorage.app",
  messagingSenderId: "690188678388",
  appId: "1:690188678388:web:0e4907b4a2cda2c9cbdaa1",
  measurementId: "G-FKFZ1NV1MN"
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)

export const getFirebaseAnalytics = () => {
  if (typeof window !== 'undefined') {
    return getAnalytics(app)
  }
  return null
}

// ─── Reading Progress ────────────────────────────────────────────────────────

export async function getReadingProgress(memberId: string, bookId: string) {
  const ref = doc(db, 'users', memberId, 'books', bookId)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function saveReadingProgress(
  memberId: string,
  bookId: string,
  data: { currentCfi: string; percentageCompleted: number }
) {
  const ref = doc(db, 'users', memberId, 'books', bookId)
  await setDoc(ref, { ...data, lastReadAt: serverTimestamp() }, { merge: true })
}

export async function initBookRecord(memberId: string, bookId: string) {
  const ref = doc(db, 'users', memberId, 'books', bookId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      currentCfi: null,
      percentageCompleted: 0,
      lastReadAt: serverTimestamp(),
    })
  }
}

// ─── Highlights ──────────────────────────────────────────────────────────────

export interface Highlight {
  id?: string
  cfiRange: string
  text: string
  color: 'gold' | 'coral'
  locationLabel?: string
  note?: string
  createdAt?: unknown
}

export async function getHighlights(memberId: string, bookId: string): Promise<Highlight[]> {
  const ref = collection(db, 'users', memberId, 'books', bookId, 'highlights')
  const snap = await getDocs(ref)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Highlight))
}

export async function addHighlight(
  memberId: string,
  bookId: string,
  highlight: Omit<Highlight, 'id' | 'createdAt'>
): Promise<string> {
  const ref = collection(db, 'users', memberId, 'books', bookId, 'highlights')
  const docRef = await addDoc(ref, { ...highlight, createdAt: serverTimestamp() })
  return docRef.id
}

export async function removeHighlight(memberId: string, bookId: string, highlightId: string) {
  const ref = doc(db, 'users', memberId, 'books', bookId, 'highlights', highlightId)
  await deleteDoc(ref)
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export interface BookmarkDoc {
  id?: string
  cfi: string
  label: string
  createdAt?: unknown
}

export async function getBookmarks(memberId: string, bookId: string): Promise<BookmarkDoc[]> {
  const ref = collection(db, 'users', memberId, 'books', bookId, 'bookmarks')
  const snap = await getDocs(ref)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookmarkDoc))
}

export async function addBookmark(
  memberId: string,
  bookId: string,
  bookmark: Omit<BookmarkDoc, 'id' | 'createdAt'>
): Promise<string> {
  const ref = collection(db, 'users', memberId, 'books', bookId, 'bookmarks')
  const docRef = await addDoc(ref, { ...bookmark, createdAt: serverTimestamp() })
  return docRef.id
}

export async function removeBookmark(memberId: string, bookId: string, bookmarkId: string) {
  const ref = doc(db, 'users', memberId, 'books', bookId, 'bookmarks', bookmarkId)
  await deleteDoc(ref)
}

// ─── User Record ─────────────────────────────────────────────────────────────

export async function ensureUserRecord(memberId: string, email: string) {
  const ref = doc(db, 'users', memberId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { email, createdAt: serverTimestamp() })
  }
}
