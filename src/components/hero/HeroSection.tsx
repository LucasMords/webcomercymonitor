import { motion } from 'framer-motion'
import { HeroCanvas } from './HeroCanvas'
import { Button } from '../ui/Button'
import { scrollToSection } from '../../utils/scrollTo'

export function HeroSection() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      <HeroCanvas />

      <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs tracking-[0.2em] uppercase text-indigo-400 font-medium mb-4 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20"
          >
            Nova Coleção 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-white mb-6 tracking-tight leading-[1.05]"
          >
            Seu Monitor.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sua Visão.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-zinc-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
          >
            viewep — monitores premium que transformam sua experiência visual, do gaming competitivo à criação profissional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => scrollToSection('catalog')}>
              Explorar Catálogo
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
            <Button size="lg" variant="ghost" onClick={() => scrollToSection('showcase')}>
              Ver Showcase
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-zinc-500 text-xs flex flex-col items-center gap-2"
          >
            <span>Scroll</span>
            <svg width="16" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="4" y="2" width="16" height="20" rx="8" />
              <motion.circle
                cx="12"
                cy="8"
                r="2"
                fill="currentColor"
                animate={{ cy: [8, 14, 8] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
