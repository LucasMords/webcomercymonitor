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
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
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
    } else if (!isLogin) {
      setError('Verifique seu email para confirmar o cadastro.')
      addToast('Email de confirmação enviado!', 'info')
    } else {
      addToast('Login realizado com sucesso!', 'success')
      onClose()
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch {
      setError('Erro ao conectar com Google.')
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

              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-zinc-500 text-xs">ou</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              <p className="text-zinc-500 text-xs text-center mt-4">
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
