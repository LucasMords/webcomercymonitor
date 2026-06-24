import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { MonitorModel } from '../../three/models/Monitor'
import { Particles } from '../../three/particles'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import * as THREE from 'three'

function HeroScene() {
  const mouse = useMouseParallax(0.02)
  const { viewport } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.normalizedX * 0.5 - groupRef.current.rotation.y) * 0.04
      groupRef.current.rotation.x += (mouse.normalizedY * 0.25 - groupRef.current.rotation.x) * 0.04
    }
  })

  const scale = viewport.width < 5 ? 0.65 : 0.85

  return (
    <>
      <ambientLight intensity={0.4} color="#303050" />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} color="#6366f1" />
      <directionalLight position={[0, -0.5, -3]} intensity={0.2} color="#818cf8" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#a78bfa" distance={8} />

      <group ref={groupRef}>
        <MonitorModel
          screenColor="#1e1b4b"
          bodyColor="#18181b"
          accentColor="#6366f1"
          autoRotate={false}
          scale={scale}
        />
      </group>

      <Particles count={400} />
      <Environment preset="city" />
    </>
  )
}

export function HeroCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
