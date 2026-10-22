import { create } from 'zustand'

interface MobileNavState {
  open: boolean
  openMenu: () => void
  closeMenu: () => void
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  open: false,
  openMenu: () => set({ open: true }),
  closeMenu: () => set({ open: false }),
}))
