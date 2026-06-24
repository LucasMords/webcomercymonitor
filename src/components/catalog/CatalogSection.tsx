import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { monitors as fallbackMonitors } from '../../data/monitors'
import { useProducts } from '../../hooks/useProducts'
import { MonitorCard } from './MonitorCard'
import { SectionTitle } from '../ui/SectionTitle'

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'professional', label: 'Profissional' },
  { key: 'ultrawide', label: 'Ultrawide' },
]

export function CatalogSection() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')

  const { products: supabaseProducts, loading } = useProducts()
  const monitors = supabaseProducts.length > 0 ? supabaseProducts : fallbackMonitors

  const filtered = useMemo(() => {
    let result = [...monitors]
    if (activeFilter === 'gaming') {
      result = result.filter((m) => {
        const rate = parseInt(m.refreshRate)
        const size = parseFloat(m.screenSize)
        return rate >= 144 && size <= 34
      })
    } else if (activeFilter === 'professional') {
      result = result.filter((m) => m.resolution.includes('3840') || m.resolution.includes('5120'))
    } else if (activeFilter === 'ultrawide') {
      result = result.filter((m) => m.curvature !== 'Flat' || parseFloat(m.screenSize) >= 34)
    }
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price)
    return result
  }, [activeFilter, sortBy, monitors])

  return (
    <section id="catalog" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          label="Catálogo"
          title="Encontre o monitor ideal"
          description="Navegue pela nossa seleção premium e encontre o monitor perfeito para o seu setup."
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex gap-1.5 p-1 bg-white/[0.02] rounded-xl border border-white/5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  activeFilter === f.key
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-zinc-400 focus:outline-none focus:border-indigo-500/30 cursor-pointer"
            aria-label="Ordenar por"
          >
            <option value="name">Nome</option>
            <option value="price-asc">Preço: Menor</option>
            <option value="price-desc">Preço: Maior</option>
          </select>
        </div>

        {loading && supabaseProducts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden animate-pulse">
                <div className="h-56 bg-white/[0.02]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-white/5 rounded-full w-16" />
                    <div className="h-5 bg-white/5 rounded-full w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <svg className="w-16 h-16 text-zinc-700 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h3 className="text-white text-lg font-medium mb-2">Nenhum monitor encontrado</h3>
            <p className="text-zinc-500 text-sm">
              Tente mudar o filtro ou categoria para encontrar o que procura.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-4 px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Mostrar todos
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((monitor, i) => (
                <motion.div
                  key={monitor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <MonitorCard monitor={monitor} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}
