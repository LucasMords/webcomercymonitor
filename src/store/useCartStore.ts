import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Monitor } from '../data/monitors'

interface CartItem {
  product: Monitor
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Monitor, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  total: number
  itemCount: number
  syncWithSupabase: (userId: string) => Promise<void>
  pushToSupabase: (userId: string) => Promise<void>
  pullFromSupabase: (userId: string) => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = [...get().items]
        const existing = items.find((i) => i.product.id === product.id)
        if (existing) {
          existing.quantity += quantity
        } else {
          items.push({ product, quantity })
        }
        set({ items })
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        })
      },
      clear: () => set({ items: [] }),
      get total() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      },
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      pushToSupabase: async (userId) => {
        const { items } = get()
        for (const item of items) {
          await supabase.from('cart_items').upsert({
            user_id: userId,
            product_id: item.product.id,
            quantity: item.quantity,
          }, { onConflict: 'user_id,product_id' })
        }
      },

      pullFromSupabase: async (userId) => {
        const { data } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', userId)

        if (!data || data.length === 0) return

        const { monitors } = await import('../data/monitors')
        const items: CartItem[] = []

        for (const row of data) {
          const product = monitors.find((m) => m.id === row.product_id)
          if (product) {
            items.push({ product, quantity: row.quantity })
          }
        }

        if (items.length > 0) {
          set({ items })
        }
      },

      syncWithSupabase: async (userId) => {
        const localItems = get().items

        const { data: remoteItems } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', userId)

        if (remoteItems && remoteItems.length > 0) {
          const { monitors } = await import('../data/monitors')
          const merged = new Map<string, number>()

          for (const item of localItems) {
            merged.set(item.product.id, item.quantity)
          }

          for (const row of remoteItems) {
            const current = merged.get(row.product_id) || 0
            merged.set(row.product_id, Math.max(current, row.quantity))
          }

          const items: CartItem[] = []
          for (const [productId, quantity] of merged) {
            const product = monitors.find((m) => m.id === productId)
            if (product) {
              items.push({ product, quantity })
            }
          }

          set({ items })

          for (const item of items) {
            await supabase.from('cart_items').upsert({
              user_id: userId,
              product_id: item.product.id,
              quantity: item.quantity,
            }, { onConflict: 'user_id,product_id' })
          }
        } else if (localItems.length > 0) {
          for (const item of localItems) {
            await supabase.from('cart_items').upsert({
              user_id: userId,
              product_id: item.product.id,
              quantity: item.quantity,
            }, { onConflict: 'user_id,product_id' })
          }
        }
      },
    }),
    {
      name: 'viewep-cart',
    }
  )
)
