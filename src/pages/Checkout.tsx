import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import { supabase } from '../lib/supabase'

type Step = 'cart' | 'address'

interface AddressData {
  name: string
  email: string
  zip: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

const steps: { key: Step; label: string; num: number }[] = [
  { key: 'cart', label: 'Produtos', num: 1 },
  { key: 'address', label: 'Endereço', num: 2 },
]

const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const emptyAddress: AddressData = {
  name: '', email: '', zip: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const clear = useCartStore((s) => s.clear)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const [step, setStep] = useState<Step>('cart')
  const [address, setAddress] = useState<AddressData>(emptyAddress)
  const [savedAddresses, setSavedAddresses] = useState<(AddressData & { id: string; label: string })[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [saveAddress, setSaveAddress] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cepLoading, setCepLoading] = useState(false)

  const email = user?.email || address.email

  // Load saved address
  useEffect(() => {
    if (!user) return
    supabase.from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setSavedAddresses(data as unknown as (AddressData & { id: string; label: string })[])
          const def = data.find((a: Record<string,unknown>) => a.is_default) || data[0]
          setSelectedAddressId(def.id as string)
          setAddress({
            name: def.name as string,
            email: '',
            zip: def.zip as string,
            street: def.street as string,
            number: (def.number as string) || '',
            complement: (def.complement as string) || '',
            neighborhood: (def.neighborhood as string) || '',
            city: def.city as string,
            state: def.state as string,
          })
        }
      })
  }, [user])

  const canProceed = useMemo(() => {
    if (step === 'cart') return items.length > 0
    if (step === 'address') {
      const hasAddress = !!(address.name && address.zip && address.street && address.city && address.state)
      if (!user) return hasAddress && !!address.email
      return hasAddress
    }
    return true
  }, [step, items.length, address, user])

  const handleCepBlur = async () => {
    const cep = address.zip.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }))
      }
    } catch { /* ignore */ }
    setCepLoading(false)
  }

  const handleNext = () => {
    if (step === 'cart') setStep('address')
    else if (step === 'address') {
      if (user && saveAddress) {
        if (selectedAddressId) {
          supabase.from('user_addresses').update(address).eq('id', selectedAddressId).then(() => {})
        } else {
          supabase.from('user_addresses').insert({ ...address, user_id: user.id }).then(() => {})
        }
      }
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step === 'address') setStep('cart')
  }

  const handleSubmit = async () => {
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
            price: i.product.price,
            quantity: i.quantity,
          })),
          customer: { ...address, email },
          userId: user?.id || null,
        }),
      })

      const data = await response.json()

      if (data.initPoint && data.initPoint.startsWith('https://')) {
        const url = new URL(data.initPoint)
        const allowedHosts = ['www.mercadopago.com', 'checkout.mercadopago.com', 'api.mercadopago.com', 'www.mercadopago.com.br', 'checkout.mercadopago.com.br', 'sandbox.mercadopago.com.br', 'sandbox.mercadopago.com']
        if (!allowedHosts.includes(url.hostname)) {
          setError('URL de pagamento inválida')
          setLoading(false)
          return
        }
        clear()
        addToast('Redirecionando para o pagamento...', 'info')
        window.location.href = data.initPoint
      } else {
        setError(data.error || 'Erro ao processar pagamento')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-semibold mb-3">Carrinho vazio</h2>
          <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer">
            Voltar para o catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-10">
          <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-3xl font-display font-bold text-white">Finalizar Compra</h1>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => { if (steps.findIndex(x=>x.key===step) > i) setStep(s.key) }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step === s.key
                    ? 'bg-indigo-500 text-white'
                    : steps.findIndex(x=>x.key===step) > i
                    ? 'bg-indigo-500/20 text-indigo-400 cursor-pointer'
                    : 'bg-white/5 text-zinc-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.key ? 'bg-white text-indigo-500' :
                  steps.findIndex(x=>x.key===step) > i ? 'bg-indigo-400 text-white' : 'bg-white/10 text-zinc-500'
                }`}>
                  {steps.findIndex(x=>x.key===step) > i ? '✓' : s.num}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 'cart' && (
            <motion.div key="cart" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-medium mb-4">Resumo do Pedido</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4">
                      <div className="w-12 h-9 rounded flex-shrink-0" style={{ backgroundColor: item.product.colorHex }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-zinc-500 text-xs">{item.product.panelType} · {item.product.screenSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">R$ {(item.product.price * item.quantity).toLocaleString()}</p>
                        <p className="text-zinc-500 text-xs">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white text-lg font-bold">R$ {total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'address' && (
            <motion.div key="address" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="text-zinc-400 text-xs font-medium mb-2 block">Endereços salvos</label>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setSelectedAddressId(a.id); setAddress({name:a.name,email:a.email||'',zip:a.zip,street:a.street,number:a.number,complement:a.complement,neighborhood:a.neighborhood,city:a.city,state:a.state}) }}
                        className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                          selectedAddressId === a.id
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                            : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {a.label}: {a.street}, {a.number} — {a.city}/{a.state}
                      </button>
                    ))}
                    <button
                      onClick={() => { setSelectedAddressId(''); setAddress(emptyAddress) }}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                        !selectedAddressId ? 'border-indigo-500/50 bg-indigo-500/10 text-white' : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white'
                      }`}
                    >
                      + Novo endereço
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-medium mb-4">Endereço de Entrega</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Nome completo *</label>
                    <input value={address.name} onChange={e=>setAddress({...address,name:e.target.value})} placeholder="Seu nome completo"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                  </div>
                  {!user && (
                    <div className="sm:col-span-2">
                      <label className="text-zinc-400 text-xs font-medium mb-1 block">E-mail *</label>
                      <input type="email" value={address.email} onChange={e=>setAddress({...address,email:e.target.value})} placeholder="seu@email.com"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">CEP *</label>
                    <div className="relative">
                      <input value={address.zip} onChange={e=>setAddress({...address,zip:e.target.value})}
                        onBlur={handleCepBlur}
                        placeholder="00000-000" maxLength={9}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                      {cepLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Rua *</label>
                    <input value={address.street} onChange={e=>setAddress({...address,street:e.target.value})} placeholder="Nome da rua"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Número</label>
                    <input value={address.number} onChange={e=>setAddress({...address,number:e.target.value})} placeholder="123"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Complemento</label>
                    <input value={address.complement} onChange={e=>setAddress({...address,complement:e.target.value})} placeholder="Apto, bloco"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Bairro</label>
                    <input value={address.neighborhood} onChange={e=>setAddress({...address,neighborhood:e.target.value})} placeholder="Seu bairro"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Cidade *</label>
                    <input value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} placeholder="Sua cidade"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500" />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-medium mb-1 block">Estado *</label>
                    <select value={address.state} onChange={e=>setAddress({...address,state:e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 cursor-pointer">
                      <option value="">Selecione</option>
                      {states.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {user && (
                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input type="checkbox" checked={saveAddress} onChange={e=>setSaveAddress(e.target.checked)}
                      className="accent-indigo-500" />
                    <span className="text-zinc-400 text-xs">Salvar endereço no meu perfil</span>
                  </label>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mt-4">
                <h3 className="text-white font-medium mb-3">Resumo do Pedido</h3>
                <div className="text-sm text-zinc-400 space-y-1 mb-3">
                  {items.map(i => (
                    <p key={i.product.id}>{i.product.name} x{i.quantity} — R$ {(i.product.price*i.quantity).toLocaleString()}</p>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white text-lg font-bold">R$ {total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3 mt-4">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer mt-4"
              >
                {loading ? 'Redirecionando...' : `Ir para pagamento — R$ ${total.toLocaleString()}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step !== 'cart' && (
            <button onClick={handleBack}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium rounded-xl transition-all border border-white/10 cursor-pointer"
            >
              Voltar
            </button>
          )}
          {step === 'cart' && (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
