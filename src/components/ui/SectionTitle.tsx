import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface SectionTitleProps {
  label: string
  title: string
  description?: string
  className?: string
  align?: 'left' | 'center'
}

export function SectionTitle({ label, title, description, className, align = 'center' }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
      className={cn('mb-16', align === 'center' ? 'text-center' : 'text-left', className)}
    >
      <span className="text-xs tracking-[0.2em] uppercase text-indigo-400 font-medium mb-3 block">
        {label}
      </span>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-4 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  )
}
