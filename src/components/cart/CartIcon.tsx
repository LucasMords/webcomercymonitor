import { motion } from 'framer-motion'
import { useCartStore } from '../../store/useCartStore'

export function CartIcon() {
  const itemCount = useCartStore((s) => s.itemCount)

  return (
    <button className="relative p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label={`Carrinho com ${itemCount} itens`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {itemCount}
        </motion.span>
      )}
    </button>
  )
}
