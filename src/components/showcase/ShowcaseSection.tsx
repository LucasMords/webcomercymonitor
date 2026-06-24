import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { MonitorModel } from '../../three/models/Monitor'
import { Particles } from '../../three/particles'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import { useCartStore } from '../../store/useCartStore'
import { useToastStore } from '../../store/useToastStore'
import { monitors } from '../../data/monitors'
import { Button } from '../ui/Button'

function ShowcaseScene() {
  const mouse = useMouseParallax(0.03)

  return (
    <>
      <ambientLight intensity={0.5} color="#303050" />
      <directionalLight position={[5, 3, 5]} intensity={0.9} color="#ffffff" />
      <directionalLight position={[-3, 1, -2]} intensity={0.4} color="#6366f1" />
      <directionalLight position={[0, -0.5, -3]} intensity={0.25} color="#818cf8" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#a78bfa" distance={10} />

      <group position={[2, 0, 0]}>
        <MonitorModel
          screenColor="#1e1b4b"
          bodyColor="#1a1a1a"
          accentColor="#6366f1"
          autoRotate={false}
          mouseParallax={mouse}
          scale={1.1}
          aspect="32:9"
          sizeInches={49}
          curved
          stand="professional"
        />
      </group>

      <Particles count={250} />
      <Environment preset="city" />
    </>
  )
}

export function ShowcaseSection() {
  const addToCart = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)

  const featuredMonitor = monitors.find((m) => m.id === 'ultra-49')

  const handleBuy = () => {
    if (featuredMonitor) {
      addToCart(featuredMonitor)
      addToast(`${featuredMonitor.name} adicionado ao carrinho`, 'success')
    }
  }

  return (
    <section id="showcase" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <ShowcaseScene />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />

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
