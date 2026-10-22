import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TasbeehState {
  counts: Record<string, number>
  activeDhikr: string
  targets: Record<string, number>
  increment: () => void
  reset: () => void
  setActiveDhikr: (dhikr: string) => void
}

const DEFAULT_TARGETS: Record<string, number> = {
  subhanAllah: 33,
  alhamdulillah: 33,
  allahuAkbar: 34,
}

export const useTasbeehStore = create<TasbeehState>()(
  persist(
    (set, get) => ({
      counts: { subhanAllah: 0, alhamdulillah: 0, allahuAkbar: 0 },
      activeDhikr: 'subhanAllah',
      targets: DEFAULT_TARGETS,
      increment: () => {
        const { activeDhikr, counts } = get()
        set({ counts: { ...counts, [activeDhikr]: (counts[activeDhikr] ?? 0) + 1 } })
      },
      reset: () => {
        const { activeDhikr, counts } = get()
        set({ counts: { ...counts, [activeDhikr]: 0 } })
      },
      setActiveDhikr: (dhikr) => set({ activeDhikr: dhikr }),
    }),
    {
      name: 'islam-tasbeeh',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const state = persistedState as
            | Partial<Pick<TasbeehState, 'counts' | 'activeDhikr' | 'targets'>>
            | undefined
          return {
            counts: state?.counts ?? { subhanAllah: 0, alhamdulillah: 0, allahuAkbar: 0 },
            activeDhikr: state?.activeDhikr ?? 'subhanAllah',
            targets: state?.targets ?? DEFAULT_TARGETS,
          }
        }
        return persistedState as Pick<TasbeehState, 'counts' | 'activeDhikr' | 'targets'>
      },
    },
  ),
)

export const DHIKR_OPTIONS = [
  { id: 'subhanAllah', label: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ' },
  { id: 'alhamdulillah', label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ' },
  { id: 'allahuAkbar', label: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ' },
] as const
