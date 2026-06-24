import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

interface Order {
  id: string
  status: string
  total: number
  customer_name: string
  created_at: string
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  paid: 'text-green-400 bg-green-400/10',
  shipped: 'text-blue-400 bg-blue-400/10',
  delivered: 'text-emerald-400 bg-emerald-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('id, status, total, customer_name, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      setOrders((data as Order[]) || [])
      setLoading(false)
    }

    fetchOrders()
  }, [user])

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-3xl font-display font-bold text-white">Meus Pedidos</h1>
        </motion.div>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <svg className="w-16 h-16 text-zinc-700 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2 className="text-white text-lg font-medium mb-2">Faça login para ver seus pedidos</h2>
            <p className="text-zinc-500 text-sm mb-4">Acompanhe o status de todas as suas compras.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              Fazer Login
            </button>
          </motion.div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-white/5 rounded w-32" />
                  <div className="h-4 bg-white/5 rounded w-20" />
                </div>
                <div className="h-3 bg-white/5 rounded w-48" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <svg className="w-16 h-16 text-zinc-700 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <h2 className="text-white text-lg font-medium mb-2">Nenhum pedido encontrado</h2>
            <p className="text-zinc-500 text-sm">Seus pedidos aparecerão aqui após a primeira compra.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Ver catálogo
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">
                      Pedido <span className="font-mono text-sm text-zinc-400">#{order.id.slice(0, 8)}</span>
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] || 'text-zinc-400 bg-zinc-400/10'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm">{order.customer_name}</p>
                  <p className="text-white font-bold text-lg">
                    ${order.total.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
