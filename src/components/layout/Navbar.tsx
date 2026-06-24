import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { CartIcon } from '../cart/CartIcon'
import { CartDrawer } from '../cart/CartDrawer'
import { UserMenu } from '../auth/UserMenu'
import { AuthModal } from '../auth/AuthModal'
import { useAuthStore } from '../../store/useAuthStore'
import { scrollToSection } from '../../utils/scrollTo'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const showAuthModal = useAuthStore((s) => s.showAuthModal)
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      sessionStorage.setItem('scrollTo', hash)
    } else {
      scrollToSection(hash)
    }
  }

  const navLinks = [
    { label: 'Home', hash: 'intro' },
    { label: 'Catálogo', hash: 'catalog' },
    { label: 'Showcase', hash: 'showcase' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2 group"
            aria-label="viewep - Ir para home"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">viewep</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.hash}
                href={`/#${link.hash}`}
                onClick={handleNavClick(link.hash)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate('/orders')}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                Pedidos
              </button>
            )}
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Abrir carrinho"
              className="cursor-pointer"
            >
              <CartIcon />
            </button>
            <UserMenu />
          </div>

          <button
            className="md:hidden text-white p-2 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.hash}
                    href={`/#${link.hash}`}
                    onClick={handleNavClick(link.hash)}
                    className="px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex items-center gap-3 px-4 py-2">
                  <button
                    onClick={() => { setCartOpen(true); setMobileOpen(false) }}
                    aria-label="Abrir carrinho"
                    className="cursor-pointer"
                  >
                    <CartIcon />
                  </button>
                  <UserMenu />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
