import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { MonitorModel } from '../../three/models/Monitor'
import { Particles } from '../../three/particles'
import { useAppStore } from '../../store/useAppStore'
import { useCartStore } from '../../store/useCartStore'
import { useToastStore } from '../../store/useToastStore'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import { useMonitorTextures } from '../../hooks/useMonitorTextures'
import type * as THREE from 'three'

function ViewerScene({ monitor, screenTexture, bodyTexture, envPreset }: {
  monitor: NonNullable<ReturnType<typeof useAppStore.getState>['selectedMonitor']>
  screenTexture: THREE.CanvasTexture | null
  bodyTexture: THREE.CanvasTexture | null
  envPreset: string
}) {
  const mouse = useMouseParallax(0.015)
  const [autoRotate, setAutoRotate] = useState(true)

  const handlePointerDown = () => setAutoRotate(false)
  const handlePointerUp = () => setTimeout(() => setAutoRotate(true), 2000)

  return (
    <>
      <ambientLight intensity={0.5} color="#303050" />
      <directionalLight position={[5, 3, 5]} intensity={0.9} color="#ffffff" />
      <directionalLight position={[-3, 1, -2]} intensity={0.4} color={monitor.accentColor} />
      <directionalLight position={[0, -0.5, -3]} intensity={0.25} color="#818cf8" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#a78bfa" distance={10} />

      <group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <MonitorModel
          screenColor="#1e1b4b"
          bodyColor={monitor.colorHex}
          accentColor={monitor.accentColor}
          autoRotate={autoRotate}
          rotationSpeed={0.2}
          mouseParallax={mouse}
          scale={1.2}
          aspect={monitor.aspect}
          sizeInches={monitor.sizeInches}
          curved={monitor.curved}
          stand={monitor.stand}
          screenTexture={screenTexture}
          bodyTexture={bodyTexture}
        />
      </group>

      <Particles count={200} />
      <Environment preset={envPreset as 'city' | 'night' | 'studio' | 'dawn'} />
    </>
  )
}

export function MonitorViewer() {
  const selectedMonitor = useAppStore((s) => s.selectedMonitor)
  const isOpen = useAppStore((s) => s.isViewerOpen)
  const toggleViewer = useAppStore((s) => s.toggleViewer)
  const addToCart = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)
  const textures = useMonitorTextures(selectedMonitor)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleViewer(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, toggleViewer])

  const handleClose = () => toggleViewer(false)

  const handleAddToCart = () => {
    if (selectedMonitor) {
      addToCart(selectedMonitor)
      addToast(`${selectedMonitor.name} adicionado ao carrinho`, 'success')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && selectedMonitor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-surface/95 backdrop-blur-2xl"
          onClick={handleClose}
          role="dialog"
          aria-label={`Visualizador 3D: ${selectedMonitor.name}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Fechar visualizador 3D"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0.5, 6], fov: 40 }}
                dpr={[1, 2]}
                gl={{ antialias: true }}
              >
                <Suspense fallback={null}>
                  <ViewerScene
                    monitor={selectedMonitor}
                    screenTexture={textures.screenTexture}
                    bodyTexture={textures.bodyTexture}
                    envPreset={textures.envPreset}
                  />
                </Suspense>
              </Canvas>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 bg-surface-light/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-display font-medium text-white">{selectedMonitor.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                        {selectedMonitor.panelType}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">{selectedMonitor.tagline}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                      {[
                        { label: 'Tamanho', value: selectedMonitor.screenSize },
                        { label: 'Resolução', value: selectedMonitor.resolution },
                        { label: 'Refresh', value: selectedMonitor.refreshRate },
                        { label: 'Resposta', value: selectedMonitor.responseTime },
                        { label: 'Curvatura', value: selectedMonitor.curvature },
                        { label: 'HDR', value: selectedMonitor.hdr },
                      ].map((spec) => (
                        <div key={spec.label}>
                          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">{spec.label}</span>
                          <p className="text-white text-sm font-medium">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-3">
                      ${selectedMonitor.price.toLocaleString()}
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
