import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface OrderData {
  id: string
  status: string
  total: number
  created_at: string
}

export function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('id, status, total, created_at')
        .eq('id', orderId)
        .single()
      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [orderId])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {loading ? (
          <p className="text-zinc-400">Carregando...</p>
        ) : !orderId ? (
          <>
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-3">Pedido Confirmado!</h1>
            <p className="text-zinc-400 mb-8">Seu pedido foi recebido e será processado em breve.</p>
          </>
        ) : order ? (
          <>
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-3">Pedido Confirmado!</h1>
            <p className="text-zinc-400 mb-2">
              Pedido <span className="text-white font-mono text-sm">#{order.id.slice(0, 8)}</span>
            </p>
            <p className="text-zinc-500 text-sm mb-2">
              Status: <span className="text-green-400 capitalize">{order.status}</span>
            </p>
            <p className="text-white text-lg font-bold mb-8">
              ${order.total.toLocaleString()}
            </p>
          </>
        ) : (
          <>
            <p className="text-zinc-400 mb-6">Pedido não encontrado.</p>
          </>
        )}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          Voltar para Home
        </button>
      </motion.div>
    </div>
  )
}
