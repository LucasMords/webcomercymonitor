import { motion } from 'framer-motion'
import { IntroMonitorImage } from './IntroMonitorImage'
import { scrollToSection } from '../../utils/scrollTo'

const letterBase = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.2 + i * 0.06,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
}

export function IntroSection() {
  return (
    <section
      id="intro"
      className="relative h-screen w-full overflow-hidden bg-surface"
    >
      <div className="absolute top-0 bottom-0 right-0 w-[55%] md:w-[58%]">
        <IntroMonitorImage />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-surface/80 pointer-events-none" />
      </div>

      <div className="relative z-10 h-full flex items-center px-8 md:px-16 lg:px-20">
        <div className="max-w-xl">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <motion.span
              variants={letterBase}
              custom={0}
              className="inline-block text-[11px] tracking-[0.25em] uppercase text-indigo-400 font-semibold mb-6 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
            >
              MONITORES PREMIUM
            </motion.span>

            <motion.h1
              className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-[-0.03em] leading-[0.95]"
            >
              <motion.span variants={letterBase} custom={1} className="inline-block">v</motion.span>
              <motion.span variants={letterBase} custom={2} className="inline-block">i</motion.span>
              <motion.span variants={letterBase} custom={3} className="inline-block">e</motion.span>
              <motion.span variants={letterBase} custom={4} className="inline-block">w</motion.span>
              <motion.span variants={letterBase} custom={5} className="inline-block">e</motion.span>
              <motion.span variants={letterBase} custom={6} className="inline-block">p</motion.span>
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-md"
          >
            Eleve sua experiência visual com monitores de alto desempenho — do gaming competitivo à criação profissional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => scrollToSection('catalog')}
              className="px-7 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center gap-2"
            >
              Explorar Catálogo
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => scrollToSection('showcase')}
              className="px-7 py-3.5 bg-transparent hover:bg-white/5 text-zinc-300 text-sm font-medium rounded-xl transition-all duration-300 border border-white/10 cursor-pointer"
            >
              Ver Showcase
            </button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-zinc-600"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <svg width="14" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" aria-hidden="true">
              <rect x="4" y="2" width="16" height="20" rx="8" />
              <motion.circle cx="12" cy="8" r="2" fill="currentColor" animate={{ cy: [8, 14, 8] }} transition={{ repeat: Infinity, duration: 2.5 }} />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
