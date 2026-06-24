import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) {
    return (
      <button
        onClick={() => setShowAuthModal(true)}
        className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
      >
        {user.email?.charAt(0).toUpperCase() || 'U'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white text-xs font-medium truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { navigate('/orders'); setOpen(false) }}
            className="w-full px-4 py-2.5 text-left text-zinc-400 hover:text-white hover:bg-white/5 text-sm transition-colors cursor-pointer"
          >
            Meus Pedidos
          </button>
          <button
            onClick={() => { signOut(); setOpen(false) }}
            className="w-full px-4 py-2.5 text-left text-zinc-400 hover:text-white hover:bg-white/5 text-sm transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
