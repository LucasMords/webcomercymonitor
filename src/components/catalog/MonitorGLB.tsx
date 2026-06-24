import { Suspense } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { Monitor } from '../../data/monitors'

function GLBModel({ url, monitor }: { url: string; monitor: Monitor }) {
  const { scene } = useGLTF(url)

  const cloned = scene.clone()

  cloned.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true

      const mat = child.material as THREE.MeshStandardMaterial
      if (mat.name?.toLowerCase().includes('screen') || child.name?.toLowerCase().includes('screen')) {
        mat.color.set('#1e1b4b')
        mat.emissive?.set('#1e1b4b')
        mat.emissiveIntensity = 0.2
      }
      if (mat.name?.toLowerCase().includes('accent') || child.name?.toLowerCase().includes('accent')) {
        mat.color.set(monitor.accentColor)
        mat.emissive?.set(monitor.accentColor)
        mat.emissiveIntensity = 0.5
      }
      mat.needsUpdate = true
    }
  })

  return <primitive object={cloned} scale={1} />
}

export function MonitorGLB({ monitor }: { monitor: Monitor }) {
  if (!monitor.model3d) return null

  return (
    <Suspense fallback={null}>
      <GLBModel url={monitor.model3d} monitor={monitor} />
    </Suspense>
  )
}
