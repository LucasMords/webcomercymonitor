import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { MonitorModel } from '../../three/models/Monitor'

function InlineMonitorScene() {
  return (
    <>
      <ambientLight intensity={0.5} color="#303050" />
      <directionalLight position={[3, 2, 3]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-2, 0.5, -2]} intensity={0.3} color="#6366f1" />
      <MonitorModel
        screenColor="#1e1b4b"
        bodyColor="#18181b"
        accentColor="#6366f1"
        autoRotate
        rotationSpeed={0.25}
        scale={0.45}
      />
      <Environment preset="city" />
    </>
  )
}

export function InlineMonitor() {
  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1"
      style={{ width: '5vw', height: '5vw' }}
    >
      <Canvas
        camera={{ position: [0, -0.1, 3.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <InlineMonitorScene />
        </Suspense>
      </Canvas>
    </span>
  )
}
