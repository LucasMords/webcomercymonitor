import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { MonitorModel } from '../../three/models/Monitor'
import { Particles } from '../../three/particles'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import * as THREE from 'three'

interface Props {
  screenTexture?: THREE.CanvasTexture | null
}

function HeroMonitorScene({ screenTexture }: Props) {
  const mouse = useMouseParallax(0.015)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.normalizedX * 0.25 - groupRef.current.rotation.y) * 0.03
      groupRef.current.rotation.x += (mouse.normalizedY * 0.15 - groupRef.current.rotation.x) * 0.03
      groupRef.current.position.y += (mouse.normalizedY * 0.1 - groupRef.current.position.y) * 0.02
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#303050" />
      <directionalLight position={[8, 5, 6]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-4, 2, -4]} intensity={0.35} color="#6366f1" />
      <directionalLight position={[0, -1, -3]} intensity={0.2} color="#818cf8" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#a78bfa" distance={10} />

      <group ref={groupRef} rotation={[0.04, 0.25, 0.02]}>
        <MonitorModel
          screenColor="#1e1b4b"
          bodyColor="#18181b"
          accentColor="#6366f1"
          autoRotate={false}
          scale={1.0}
          stand="arm"
          screenTexture={screenTexture}
          aspect="16:9"
          sizeInches={32}
        />
      </group>

      <Particles count={250} />
      <Environment preset="city" />
    </>
  )
}

export function HeroMonitorCanvas({ screenTexture }: Props) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [1.2, 0.6, 5.5], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <HeroMonitorScene screenTexture={screenTexture} />
        </Suspense>
      </Canvas>
    </div>
  )
}
