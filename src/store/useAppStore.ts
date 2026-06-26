import { create } from 'zustand'
import type { Monitor } from '../data/monitors'

interface AppState {
  selectedMonitor: Monitor | null
  isViewerOpen: boolean
  scrollProgress: number
  setSelectedMonitor: (monitor: Monitor | null) => void
  toggleViewer: (open: boolean) => void
  setScrollProgress: (progress: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedMonitor: null,
  isViewerOpen: false,
  scrollProgress: 0,
  setSelectedMonitor: (monitor) => set({ selectedMonitor: monitor }),
  toggleViewer: (open) => set({ isViewerOpen: open }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}))
