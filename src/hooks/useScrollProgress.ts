import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useScrollProgress() {
  const setScrollProgress = useAppStore((s) => s.setScrollProgress)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollProgress])
}
