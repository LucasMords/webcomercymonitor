import { motion } from 'framer-motion'
import { ProductImageRealistic } from '../catalog/ProductImageRealistic'
import { useCartStore } from '../../store/useCartStore'
import { useToastStore } from '../../store/useToastStore'
import { monitors } from '../../data/monitors'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

export function ShowcaseSection() {
  const addToCart = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()
  const monitor = monitors.find((m) => m.id === 'ultra-49')!

  const handleBuy = () => {
    addToCart(monitor)
    addToast(`${monitor.name} adicionado ao carrinho`, 'success')
    navigate('/checkout')
  }

  return (
    <section id="showcase" className="relative min-h-screen overflow-hidden bg-surface">
      {/* Background ambient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02]" />

      {/* Product image on right */}
      <div className="absolute top-0 bottom-0 right-0 w-[55%] md:w-[52%]">
        <ProductImageRealistic monitor={monitor} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-surface/90 pointer-events-none" />
      </div>

      {/* Text + CTA on left */}
      <div className="relative z-10 h-screen flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Destaque
            </span>
            <h2 className="text-5xl md:text-6xl font-display font-medium text-white mt-6 mb-4 tracking-tight leading-[1.1]">
              UltraView 49
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              O monitor super ultrawide definitivo. 49 polegadas de imersão QD-OLED com 240Hz — uma experiência que redefine o que é possível.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {['49" QD-OLED', '5120x1440', '240Hz', 'HDR10+', '1800R'].map((spec) => (
                <span key={spec} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 border border-white/5">
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-3xl font-bold text-white">$1.499</span>
              </div>
              <Button size="lg" onClick={handleBuy}>Comprar</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
