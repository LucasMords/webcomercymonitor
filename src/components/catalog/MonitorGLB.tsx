import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { Monitor } from '../../data/monitors'

function GLBModel({ url, monitor, screenTexture }: {
  url: string
  monitor: Monitor
  screenTexture: THREE.CanvasTexture | null
}) {
  const { scene } = useGLTF(url)

  const cloned = useMemo(() => {
    const c = scene.clone()
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mat = child.material as THREE.MeshStandardMaterial
        const name = (child.name + mat.name).toLowerCase()
        if (name.includes('screen')) {
          if (screenTexture) {
            mat.map = screenTexture
            mat.color.set('#ffffff')
            mat.emissive?.set('#ffffff')
            mat.emissiveIntensity = 0.4
            mat.roughness = 0.15
            mat.metalness = 0.02
          } else {
            mat.color.set('#1e1b4b')
            mat.emissive?.set('#1e1b4b')
            mat.emissiveIntensity = 0.2
          }
        }
        if (name.includes('accent')) {
          mat.color.set(monitor.accentColor)
          mat.emissive?.set(monitor.accentColor)
          mat.emissiveIntensity = 0.5
        }
        mat.needsUpdate = true
      }
    })
    return c
  }, [scene, screenTexture, monitor.accentColor])

  return <primitive object={cloned} scale={1} />
}

export function MonitorGLB({ monitor, screenTexture }: {
  monitor: Monitor
  screenTexture?: THREE.CanvasTexture | null
}) {
  if (!monitor.model3d) return null

  return (
    <Suspense fallback={null}>
      <GLBModel url={monitor.model3d} monitor={monitor} screenTexture={screenTexture || null} />
    </Suspense>
  )
}
