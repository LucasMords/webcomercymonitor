import { motion } from 'framer-motion'
import { SectionTitle } from '../ui/SectionTitle'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Taxa de Atualização',
    description: 'De 144Hz a 360Hz para jogabilidade fluida e sem tearing. Cada frame conta na competição.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Resolução 4K/5K',
    description: 'Imagens nítidas com densidade de pixels excepcional. Perfeito para criadores e profissionais.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10" />
        <path d="M2 12h20" />
      </svg>
    ),
    title: 'Tecnologia de Painel',
    description: 'QD-OLED, Nano IPS e VA com pretos profundos, cores vibrantes e ângulos de visão amplos.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
    title: 'Design Curvo',
    description: 'Curvatura 1500R a 2300R para imersão total. Envolve seu campo de visão naturalmente.',
    gradient: 'from-amber-500 to-orange-500',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          label="Por que viewep"
          title="Tecnologia que faz a diferença"
          description="Cada monitor é selecionado para oferecer o melhor em qualidade de imagem, velocidade e design."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-white text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
