import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const clear = useCartStore((s) => s.clear)
  const user = useAuthStore((s) => s.user)
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const [name, setName] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-semibold mb-3">Carrinho vazio</h2>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer"
          >
            Voltar para o catálogo
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price * 100,
            quantity: i.quantity,
          })),
          customer: { name, email, address, city, zip },
          userId: user?.id || null,
        }),
      })

      const data = await response.json()

      if (data.initPoint) {
        clear()
        addToast('Redirecionando para o pagamento...', 'info')
        window.location.href = data.initPoint
      } else {
        setError(data.error || 'Erro ao processar pagamento')
        addToast('Erro ao processar pagamento', 'error')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      addToast('Erro de conexão', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatLabel = (text: string, required?: boolean) => (
    <span className="text-zinc-400 text-xs font-medium mb-1 block">
      {text}{required ? ' *' : ''}
    </span>
  )

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
          <h1 className="text-3xl font-display font-bold text-white">Finalizar Compra</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
            <fieldset className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <legend className="text-white font-medium mb-4">Dados de Entrega</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="name">{formatLabel('Nome completo', true)}</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email">{formatLabel('Email', true)}</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address">{formatLabel('Endereço', true)}</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Rua, número, complemento"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="city">{formatLabel('Cidade', true)}</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Sua cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="zip">{formatLabel('CEP', true)}</label>
                  <input
                    id="zip"
                    type="text"
                    placeholder="00000-000"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </fieldset>

            {!user && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">
                  Já tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Fazer login
                  </button>
                  {' '}para salvar seus pedidos.
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              {loading ? 'Processando...' : `Pagar $${total.toLocaleString()}`}
            </button>
          </form>

          <div className="md:col-span-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-white font-medium mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="text-white">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between">
                <span className="text-white font-medium">Total</span>
                <span className="text-white text-lg font-bold">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
