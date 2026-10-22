import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LastSurahReading {
  surahId: number
  ayah: number
  englishName?: string
  updatedAt: number
}

export interface LastHadithReading {
  collection: string
  id: string
  bookNumber?: string
  label?: string
  updatedAt: number
}

export type Bookmark =
  | { type: 'ayah'; surahId: number; ayah: number; label: string; createdAt: number }
  | { type: 'hadith'; collection: string; id: string; label: string; createdAt: number }

type BookmarkInput =
  | { type: 'ayah'; surahId: number; ayah: number; label: string }
  | { type: 'hadith'; collection: string; id: string; label: string }

interface ReadingState {
  lastSurah: LastSurahReading | null
  lastHadith: LastHadithReading | null
  bookmarks: Bookmark[]
  setLastSurah: (reading: Omit<LastSurahReading, 'updatedAt'>) => void
  setLastHadith: (reading: Omit<LastHadithReading, 'updatedAt'>) => void
  addBookmark: (bookmark: BookmarkInput) => void
  removeBookmark: (predicate: (b: Bookmark) => boolean) => void
}

function sameBookmark(a: Bookmark, b: BookmarkInput): boolean {
  if (a.type === 'ayah' && b.type === 'ayah') {
    return a.surahId === b.surahId && a.ayah === b.ayah
  }
  if (a.type === 'hadith' && b.type === 'hadith') {
    return a.collection === b.collection && a.id === b.id
  }
  return false
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false
  const entry = value as Bookmark
  if (entry.type === 'ayah') {
    return (
      typeof entry.surahId === 'number' &&
      typeof entry.ayah === 'number' &&
      typeof entry.label === 'string'
    )
  }
  if (entry.type === 'hadith') {
    return (
      typeof entry.collection === 'string' &&
      typeof entry.id === 'string' &&
      typeof entry.label === 'string'
    )
  }
  return false
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      lastSurah: null,
      lastHadith: null,
      bookmarks: [],
      setLastSurah: (reading) =>
        set({ lastSurah: { ...reading, updatedAt: Date.now() } }),
      setLastHadith: (reading) =>
        set({ lastHadith: { ...reading, updatedAt: Date.now() } }),
      addBookmark: (bookmark) =>
        set((state) => {
          if (state.bookmarks.some((b) => sameBookmark(b, bookmark))) return state
          const next: Bookmark = { ...bookmark, createdAt: Date.now() }
          return {
            bookmarks: [next, ...state.bookmarks].slice(0, 20),
          }
        }),
      removeBookmark: (predicate) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => !predicate(b)),
        })),
    }),
    {
      name: 'islam-reading',
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<ReadingState>
        return {
          lastSurah: state.lastSurah ?? null,
          lastHadith: state.lastHadith ?? null,
          bookmarks: Array.isArray(state.bookmarks)
            ? state.bookmarks.filter(isBookmark).slice(0, 20)
            : [],
        }
      },
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<ReadingState>
        return {
          ...current,
          ...incoming,
          lastSurah: incoming.lastSurah ?? null,
          lastHadith: incoming.lastHadith ?? null,
          bookmarks: Array.isArray(incoming.bookmarks)
            ? incoming.bookmarks.filter(isBookmark).slice(0, 20)
            : [],
        }
      },
    },
  ),
)
