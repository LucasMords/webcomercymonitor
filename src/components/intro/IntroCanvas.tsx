import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { MonitorModel } from '../../three/models/Monitor'
import { Particles } from '../../three/particles'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import * as THREE from 'three'

function IntroScene() {
  const mouse = useMouseParallax(0.015)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.normalizedX * 0.4 - groupRef.current.rotation.y) * 0.04
      groupRef.current.rotation.x += (mouse.normalizedY * 0.2 - groupRef.current.rotation.x) * 0.04
      groupRef.current.position.y += (mouse.normalizedY * 0.15 - groupRef.current.position.y) * 0.03
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#303050" />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} color="#6366f1" />
      <directionalLight position={[0, -0.5, -3]} intensity={0.2} color="#818cf8" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#a78bfa" distance={8} />

      <group ref={groupRef} position={[0.2, 0.1, -0.2]}>
        <MonitorModel
          screenColor="#1e1b4b"
          bodyColor="#18181b"
          accentColor="#6366f1"
          autoRotate={false}
          scale={1.05}
        />
      </group>

      <Particles count={400} />
      <Environment preset="city" />
    </>
  )
}

export function IntroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <IntroScene />
      </Suspense>
    </Canvas>
  )
}
