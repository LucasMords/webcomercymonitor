import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { MonitorModel } from '../../three/models/Monitor'
import { ProductImage } from './ProductImage'
import { useMonitorTextures } from '../../hooks/useMonitorTextures'
import type { Monitor } from '../../data/monitors'
import { useAppStore } from '../../store/useAppStore'
import { useCartStore } from '../../store/useCartStore'
import { useToastStore } from '../../store/useToastStore'

interface MonitorCardProps {
  monitor: Monitor
  index: number
}

function CardCanvas({ monitor }: { monitor: Monitor }) {
  const { screenTexture, bodyTexture, envPreset } = useMonitorTextures(monitor)

  return (
    <Canvas
      camera={{ position: [0, 0.3, 5], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} color="#303050" />
      <directionalLight position={[3, 2, 3]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-2, 0.5, -2]} intensity={0.3} color={monitor.accentColor} />
      <MonitorModel
        screenColor="#1e1b4b"
        bodyColor={monitor.colorHex}
        accentColor={monitor.accentColor}
        autoRotate={false}
        scale={0.7}
        aspect={monitor.aspect}
        sizeInches={monitor.sizeInches}
        curved={monitor.curved}
        stand={monitor.stand}
        screenTexture={screenTexture}
        bodyTexture={bodyTexture}
      />
      <Environment preset={envPreset} />
    </Canvas>
  )
}

export function MonitorCard({ monitor, index }: MonitorCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const setSelected = useAppStore((s) => s.setSelectedMonitor)
  const toggleViewer = useAppStore((s) => s.toggleViewer)
  const addToCart = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleClick = () => {
    setSelected(monitor)
    toggleViewer(true)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(monitor)
    addToast(`${monitor.name} adicionado ao carrinho`, 'success')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <motion.div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          mouseX.set(0.5)
          mouseY.set(0.5)
        }}
        onMouseMove={handleMouse}
        onClick={handleClick}
        style={{ rotateX, rotateY }}
        className="relative rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-colors duration-500"
      >
        <div className="h-56 relative">
          {monitor.image ? (
            <ProductImage
              colorHex={monitor.colorHex}
              accentColor={monitor.accentColor}
              name={monitor.name}
            />
          ) : (
            <CardCanvas monitor={monitor} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>

        <div className="p-5 relative">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-medium text-base">{monitor.name}</h3>
              <p className="text-zinc-500 text-xs mt-0.5">{monitor.tagline}</p>
            </div>
            <span className="text-white font-semibold">
              ${monitor.price.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
              {monitor.resolution}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
              {monitor.refreshRate}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
              {monitor.panelType}
            </span>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            className="flex items-center justify-between"
          >
            <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
              Ver em 3D
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
            <button
              onClick={handleAddToCart}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all cursor-pointer"
            >
              Adicionar
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
