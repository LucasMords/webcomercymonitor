import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { CartItem } from './CartItem'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const itemCount = useCartStore((s) => s.itemCount)
  const total = useCartStore((s) => s.total)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-md bg-surface border-l border-white/5 flex flex-col"
            role="dialog"
            aria-label="Carrinho de compras"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm">
                Carrinho ({itemCount})
              </h3>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar carrinho"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  <span className="text-sm">Seu carrinho está vazio</span>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem key={item.product.id} productId={item.product.id} />
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-sm">Total</span>
                  <span className="text-white text-lg font-bold">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose()
                    navigate('/checkout')
                  }}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
