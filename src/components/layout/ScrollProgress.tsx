import { useAppStore } from '../../store/useAppStore'

export function ScrollProgress() {
  const progress = useAppStore((s) => s.scrollProgress)

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-100"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
