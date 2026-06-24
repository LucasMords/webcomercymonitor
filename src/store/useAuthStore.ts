import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useCartStore } from './useCartStore'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

async function syncCartForUser(userId: string) {
  try {
    const cartStore = useCartStore.getState()
    await cartStore.syncWithSupabase(userId)
  } catch {
    // silently fail — cart stays in localStorage
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  showAuthModal: false,

  setShowAuthModal: (show) => set({ showAuthModal: show }),

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    const session = data.session
    set({ session, user: session?.user ?? null, loading: false })

    if (session?.user) {
      syncCartForUser(session.user.id)
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      set({ session, user })

      if (user) {
        syncCartForUser(user.id)
      }
    })
  },
}))
