import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = isLogin
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password)

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
      addToast(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!', 'success')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-sm"
              role="dialog"
              aria-label={isLogin ? 'Entrar' : 'Criar Conta'}
            >
              <h2 className="text-white text-xl font-semibold mb-6">
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="auth-email" className="text-zinc-400 text-xs font-medium mb-1 block">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className="text-zinc-400 text-xs font-medium mb-1 block">Senha</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-500"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
                >
                  {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
                </button>
              </form>

              <p className="text-zinc-500 text-xs text-center mt-6">
                {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError('') }}
                  className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {isLogin ? 'Cadastre-se' : 'Entrar'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
