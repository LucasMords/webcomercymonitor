import { motion } from 'framer-motion'
import { useCartStore } from '../../store/useCartStore'
import { useToastStore } from '../../store/useToastStore'

interface CartItemProps {
  productId: string
}

export function CartItem({ productId }: CartItemProps) {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const addToast = useToastStore((s) => s.addToast)

  const item = items.find((i) => i.product.id === productId)
  if (!item) return null

  const { product, quantity } = item

  const handleRemove = () => {
    removeItem(product.id)
    addToast(`${product.name} removido do carrinho`, 'info')
  }

  return (
    <motion.div layout className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <div
        className="w-12 h-12 rounded-lg flex-shrink-0"
        style={{ backgroundColor: product.colorHex || '#18181b' }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium truncate">{product.name}</h4>
        <p className="text-zinc-500 text-xs">{product.panelType}</p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-5 h-5 rounded bg-white/5 text-zinc-400 hover:text-white text-xs flex items-center justify-center cursor-pointer"
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="text-white text-xs w-4 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-5 h-5 rounded bg-white/5 text-zinc-400 hover:text-white text-xs flex items-center justify-center cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>
          <span className="text-white text-sm font-medium">
            R$ {(product.price * quantity).toLocaleString()}
          </span>
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="text-zinc-600 hover:text-red-400 transition-colors self-start mt-1 cursor-pointer"
        aria-label={`Remover ${product.name} do carrinho`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}
