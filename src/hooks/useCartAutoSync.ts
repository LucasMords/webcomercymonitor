import { useEffect } from 'react'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

export function useCartAutoSync() {
  const items = useCartStore((s) => s.items)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) return

    const timer = setTimeout(() => {
      useCartStore.getState().pushToSupabase(user.id)
    }, 300)

    return () => clearTimeout(timer)
  }, [items, user])
}
