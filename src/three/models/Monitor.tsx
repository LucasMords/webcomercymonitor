import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { createScreenMaterial, createBodyMaterial, createStandMaterial, createBaseMaterial } from '../materials'

interface MonitorModelProps {
  screenColor?: string
  bodyColor?: string
  accentColor?: string
  autoRotate?: boolean
  rotationSpeed?: number
  mouseParallax?: { x: number; y: number }
  scale?: number
  stand?: 'fixed' | 'gaming' | 'professional' | 'arm' | 'minimalist'
  screenTexture?: THREE.CanvasTexture | null
  bodyTexture?: THREE.CanvasTexture | null
  aspect?: '16:9' | '21:9' | '32:9'
  sizeInches?: number
  curved?: boolean
}

function getDimensions(aspect: string, sizeInches: number) {
  const baseHeight = 3.375
  const sizeScale = sizeInches / 27
  const height = baseHeight * sizeScale

  const ratios: Record<string, number> = { '16:9': 16 / 9, '21:9': 21 / 9, '32:9': 32 / 9 }
  const ratio = ratios[aspect] || 16 / 9
  const width = height * ratio

  const depth = 0.08 * sizeScale
  const bezelDepth = 0.04 * sizeScale
  const backDepth = 0.14 * sizeScale

  return { width, height, depth, bezelDepth, backDepth, sizeScale }
}

function createCurvedScreenGeometry(width: number, height: number, radius: number, segments: number) {
  const geo = new THREE.BufferGeometry()
  const segW = Math.max(Math.floor(segments * (width / 6)), 8)

  const anglePerSegment = width / radius
  const halfAngle = anglePerSegment / 2

  const vertices: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segW; i++) {
    const t = i / segW
    const u = t
    const angle = (t - 0.5) * anglePerSegment
    const cx = Math.sin(angle) * radius - Math.sin(-halfAngle) * radius
    const cz = (Math.cos(angle) - 1) * radius

    for (let j = 0; j <= 1; j++) {
      const y = (j === 0 ? height / 2 : -height / 2)
      vertices.push(cx, y, cz)
      const nx = -Math.sin(angle)
      const nz = Math.cos(angle)
      normals.push(nx, 0, nz)
      uvs.push(u, j)
    }
  }

  for (let i = 0; i < segW; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3
    indices.push(a, c, b)
    indices.push(b, c, d)
  }

  geo.setIndex(indices)
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.computeVertexNormals()

  return geo
}

function FixedStand({ accentColor, sizeScale }: { accentColor: string; sizeScale: number }) {
  return (
    <>
      <mesh position={[0, -1.15 * sizeScale, 0.1]} castShadow>
        <boxGeometry args={[0.22 * sizeScale, 1.4 * sizeScale, 0.15]} />
        <primitive object={useMemo(() => createStandMaterial(), [])} attach="material" />
      </mesh>
      <mesh position={[0, -0.45 * sizeScale, 0.15]} castShadow>
        <cylinderGeometry args={[0.14 * sizeScale, 0.14 * sizeScale, 0.18, 16]} />
        <primitive object={useMemo(() => createStandMaterial(), [])} attach="material" />
      </mesh>
      <mesh position={[0, -1.88 * sizeScale, 0.05]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8 * sizeScale, 0.95 * sizeScale, 0.08, 32]} />
        <primitive object={useMemo(() => createBaseMaterial(), [])} attach="material" />
      </mesh>
      <mesh position={[0, -1.84 * sizeScale, 0.05]} castShadow>
        <torusGeometry args={[0.82 * sizeScale, 0.015, 16, 64]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>
    </>
  )
}

function GamingStand({ accentColor, sizeScale }: { accentColor: string; sizeScale: number }) {
  const legAngle = 0.45
  const legLength = 1.1 * sizeScale
  const legWidth = 0.08 * sizeScale
  const legHeight = 0.08 * sizeScale

  return (
    <group>
      <mesh position={[0, -0.4 * sizeScale, 0.12]} castShadow>
        <boxGeometry args={[0.3 * sizeScale, 0.05 * sizeScale, 0.3 * sizeScale]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.8 * sizeScale, 0.05]} castShadow>
        <boxGeometry args={[0.16 * sizeScale, 0.8 * sizeScale, 0.12 * sizeScale]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>

      <group position={[0, -1.2 * sizeScale, 0]}>
        <group rotation={[0, 0, legAngle]} position={[0, 0, 0.12 * sizeScale]}>
          <mesh castShadow>
            <boxGeometry args={[legWidth, legHeight, legLength]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, legLength * 0.45]}>
            <boxGeometry args={[legWidth, legHeight * 2.5, legHeight * 2]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
        </group>
        <group rotation={[0, 0, -legAngle]} position={[0, 0, 0.12 * sizeScale]}>
          <mesh castShadow>
            <boxGeometry args={[legWidth, legHeight, legLength]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, legLength * 0.45]}>
            <boxGeometry args={[legWidth, legHeight * 2.5, legHeight * 2]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function ProfessionalStand({ accentColor, sizeScale }: { accentColor: string; sizeScale: number }) {
  return (
    <group>
      <mesh position={[0, -0.3 * sizeScale, 0.15]} castShadow>
        <boxGeometry args={[0.35 * sizeScale, 0.04 * sizeScale, 0.18 * sizeScale]} />
        <meshStandardMaterial color="#333" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.85 * sizeScale, 0.08]} castShadow>
        <boxGeometry args={[0.1 * sizeScale, 1.1 * sizeScale, 0.08 * sizeScale]} />
        <meshStandardMaterial color="#333" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0, -1.45 * sizeScale, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.5 * sizeScale, 0.06 * sizeScale, 0.9 * sizeScale]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, -1.42 * sizeScale, 0.02]} castShadow>
        <boxGeometry args={[0.3 * sizeScale, 0.02 * sizeScale, 0.2 * sizeScale]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} roughness={0.2} />
      </mesh>
    </group>
  )
}

function ArmStand({ accentColor, sizeScale }: { accentColor: string; sizeScale: number }) {
  const s = sizeScale
  return (
    <>
      <mesh position={[0, 0.3 * s, 0.28 * s]}>
        <boxGeometry args={[0.6 * s, 0.6 * s, 0.04 * s]} />
        <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.8} />
      </mesh>
      <group position={[0, -0.55 * s, 0.3 * s]} rotation={[-0.3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.12 * s, 0.6 * s, 0.12 * s]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.2 * s, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.35 * s, 12]} />
          <meshStandardMaterial color="#444444" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
      <mesh position={[0, -0.85 * s, 0.3 * s]} castShadow>
        <sphereGeometry args={[0.1 * s, 16, 12]} />
        <meshStandardMaterial color="#222222" roughness={0.2} metalness={0.8} />
      </mesh>
      <group position={[0, -0.9 * s, 0.28 * s]} rotation={[0.5, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.12 * s, 0.7 * s, 0.12 * s]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.25 * s, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.4 * s, 12]} />
          <meshStandardMaterial color="#444444" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
      <mesh position={[0, -1.7 * s, 0.06 * s]} castShadow receiveShadow>
        <boxGeometry args={[0.7 * s, 0.06 * s, 0.7 * s]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -1.67 * s, 0.06 * s]} castShadow>
        <boxGeometry args={[0.5 * s, 0.03 * s, 0.5 * s]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.4} roughness={0.2} />
      </mesh>
    </>
  )
}

function MinimalistStand({ accentColor, sizeScale }: { accentColor: string; sizeScale: number }) {
  return (
    <group>
      <mesh position={[0, -0.25 * sizeScale, 0.12]} castShadow>
        <boxGeometry args={[0.25 * sizeScale, 0.03 * sizeScale, 0.14 * sizeScale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.1} metalness={0.95} />
      </mesh>
      <mesh position={[0, -0.9 * sizeScale, 0.05]} castShadow>
        <boxGeometry args={[0.06 * sizeScale, 1.3 * sizeScale, 0.04 * sizeScale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.1} metalness={0.95} />
      </mesh>
      <mesh position={[0, -1.6 * sizeScale, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[1.2 * sizeScale, 0.04 * sizeScale, 0.6 * sizeScale]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.15} metalness={0.85} />
      </mesh>
      <mesh position={[0, -1.58 * sizeScale, 0.01]}>
        <boxGeometry args={[0.15 * sizeScale, 0.015, 0.08 * sizeScale]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.25} roughness={0.2} />
      </mesh>
    </group>
  )
}

function Stand({
  type,
  accentColor,
  sizeScale,
}: {
  type: string
  accentColor: string
  sizeScale: number
}) {
  switch (type) {
    case 'gaming':
      return <GamingStand accentColor={accentColor} sizeScale={sizeScale} />
    case 'professional':
      return <ProfessionalStand accentColor={accentColor} sizeScale={sizeScale} />
    case 'arm':
      return <ArmStand accentColor={accentColor} sizeScale={sizeScale} />
    case 'minimalist':
      return <MinimalistStand accentColor={accentColor} sizeScale={sizeScale} />
    case 'fixed':
    default:
      return <FixedStand accentColor={accentColor} sizeScale={sizeScale} />
  }
}

export function MonitorModel({
  screenColor = '#1e1b4b',
  bodyColor = '#1a1a1a',
  accentColor = '#6366f1',
  autoRotate = true,
  rotationSpeed = 0.3,
  mouseParallax = { x: 0, y: 0 },
  scale = 1,
  stand = 'fixed',
  screenTexture = null,
  bodyTexture = null,
  aspect = '16:9',
  sizeInches = 27,
  curved = false,
}: MonitorModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.ShaderMaterial>(null)

  const { width, height, depth, bezelDepth, backDepth, sizeScale } = getDimensions(aspect, sizeInches)

  const screenMat = useMemo(() => createScreenMaterial(), [])
  const bodyMat = useMemo(() => {
    const mat = createBodyMaterial(bodyColor)
    if (bodyTexture) {
      mat.map = bodyTexture
      mat.color.set('#ffffff')
      mat.roughness = 0.6
      mat.metalness = 0.1
      mat.needsUpdate = true
    }
    return mat
  }, [bodyColor, bodyTexture])

  const texMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.05,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.3,
    })
  }, [])

  useEffect(() => {
    if (screenMat && !screenTexture) {
      screenMat.uniforms.uColor.value = new THREE.Color(screenColor)
      screenMat.uniforms.uAccent.value = new THREE.Color(accentColor)
    }
  }, [screenMat, screenColor, accentColor, screenTexture])

  if (screenTexture && texMaterial) {
    texMaterial.map = screenTexture
    texMaterial.needsUpdate = true
  }

  const curvedGeo = useMemo(() => {
    if (!curved) return null
    const curveRadius = 5.0
    return createCurvedScreenGeometry(width, height, curveRadius, 64)
  }, [curved, width, height])

  useFrame((state) => {
    if (!groupRef.current) return
    const targetRotY = autoRotate
      ? state.clock.elapsedTime * rotationSpeed + mouseParallax.x * 0.5
      : mouseParallax.x * 0.5
    const targetRotX = mouseParallax.y * 0.3

    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05

    if (screenRef.current && !screenTexture) {
      screenRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }

    if (screenTexture) {
      screenTexture.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      <group position={[0, 0.3 * sizeScale, 0]}>
        {curved && curvedGeo ? (
          <mesh geometry={curvedGeo} position={[0, 0, 0]}>
            {screenTexture ? (
              <primitive object={texMaterial} attach="material" />
            ) : (
              <primitive object={screenMat} attach="material" />
            )}
          </mesh>
        ) : (
          <>
            <RoundedBox args={[width, height, depth]} radius={0.06 * sizeScale} position={[0, 0, 0]}>
              {screenTexture ? (
                <primitive object={texMaterial} attach="material" />
              ) : (
                <primitive object={screenMat} attach="material" />
              )}
            </RoundedBox>
            <mesh position={[0, 0, -bezelDepth]} castShadow>
              <boxGeometry args={[width + 0.08 * sizeScale, height + 0.08 * sizeScale, bezelDepth]} />
              <primitive object={bodyMat} attach="material" />
            </mesh>
            <RoundedBox args={[width - 0.2 * sizeScale, height - 0.2 * sizeScale, backDepth]} radius={0.1 * sizeScale} position={[0, 0, backDepth * 0.6]}>
              <primitive object={bodyMat} attach="material" />
            </RoundedBox>
            <mesh position={[0, -height * 0.38, backDepth * 0.85]} castShadow>
              <boxGeometry args={[1.2 * sizeScale, 1.2 * sizeScale, backDepth * 0.5]} />
              <primitive object={bodyMat} attach="material" />
            </mesh>
          </>
        )}
      </group>

      <Stand type={stand} accentColor={accentColor} sizeScale={sizeScale} />
    </group>
  )
}
