import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useCartStore } from '../../store/useCartStore'
import { useToastStore } from '../../store/useToastStore'
import { ProductImageRealistic } from './ProductImageRealistic'

export function MonitorViewer() {
  const selected = useAppStore((s) => s.selectedMonitor)
  const isOpen = useAppStore((s) => s.isViewerOpen)
  const toggle = useAppStore((s) => s.toggleViewer)
  const addToCart = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()

  const handleClose = () => toggle(false)

  const handleBuy = () => {
    if (selected) {
      addToCart(selected)
      addToast(`${selected.name} adicionado ao carrinho`, 'success')
      toggle(false)
      navigate('/checkout')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-surface/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-label={selected.name}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Fechar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Product image */}
              <div className="h-80 md:h-full min-h-[320px] relative bg-surface-light/50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
                <ProductImageRealistic monitor={selected} />
              </div>

              {/* Product details */}
              <div className="p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                    {selected.panelType}
                  </span>
                  {selected.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20">
                      Destaque
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-display font-bold text-white mb-1">{selected.name}</h2>
                <p className="text-zinc-400 text-sm mb-6">{selected.tagline}</p>

                {/* Specs grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
                  {[
                    { l: 'Tamanho', v: selected.screenSize },
                    { l: 'Resolução', v: selected.resolution },
                    { l: 'Taxa', v: selected.refreshRate },
                    { l: 'Painel', v: selected.panelType },
                    { l: 'Resposta', v: selected.responseTime },
                    { l: 'Curvatura', v: selected.curvature },
                    { l: 'HDR', v: selected.hdr },
                    { l: 'Cor', v: selected.color },
                  ].map((s) => (
                    <div key={s.l}>
                      <span className="text-zinc-500 text-[10px] uppercase tracking-wider">{s.l}</span>
                      <p className="text-white text-sm font-medium">{s.v}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selected.features.map((f) => (
                    <span key={f} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 text-zinc-300 border border-white/5">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-zinc-400 text-sm">Preço</span>
                    <span className="text-3xl font-bold text-white">${selected.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBuy}
                      className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                    >
                      Comprar Agora
                    </button>
                    <button
                      onClick={() => { addToCart(selected); addToast(`${selected.name} adicionado ao carrinho`, 'success') }}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/10 cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
