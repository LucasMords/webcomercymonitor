import { cn } from '../../utils/cn'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export function Button({ children, variant = 'primary', size = 'md', className, onClick }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer border tracking-wide'
  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-400 text-white border-indigo-400/30 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-sm',
    ghost: 'bg-transparent hover:bg-white/5 text-zinc-300 border-transparent',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} onClick={onClick}>
      {children}
    </button>
  )
}
