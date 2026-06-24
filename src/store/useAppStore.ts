import { create } from 'zustand'
import type { Monitor } from '../data/monitors'

interface AppState {
  selectedMonitor: Monitor | null
  isViewerOpen: boolean
  activeFilter: string
  scrollProgress: number
  setSelectedMonitor: (monitor: Monitor | null) => void
  toggleViewer: (open: boolean) => void
  setActiveFilter: (filter: string) => void
  setScrollProgress: (progress: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedMonitor: null,
  isViewerOpen: false,
  activeFilter: 'all',
  scrollProgress: 0,
  setSelectedMonitor: (monitor) => set({ selectedMonitor: monitor }),
  toggleViewer: (open) => set({ isViewerOpen: open }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}))
