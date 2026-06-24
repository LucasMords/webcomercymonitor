import { Suspense, useRef, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

function ScreenPlane() {
  const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null)
  const { viewport } = useThree()

  useLayoutEffect(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(0, 0, 0)
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
  })

  const shader = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#e8e8f0') },
      uAccent: { value: new THREE.Color('#d0d0e0') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPos;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      void main() {
        float edge = 1.0 - (smoothstep(0.0, 0.02, vUv.x) * smoothstep(0.0, 0.02, 1.0 - vUv.x)
                     * smoothstep(0.0, 0.03, vUv.y) * smoothstep(0.0, 0.03, 1.0 - vUv.y));
        float scanline = sin(vUv.y * 120.0 + uTime * 0.3) * 0.015 + 0.985;
        float vignette = 1.0 - length(vUv - 0.5) * 0.4;
        vec3 col = mix(uColor, uAccent, sin(vUv.y * 3.0 + vUv.x * 2.0 + uTime * 0.15) * 0.08 + 0.5);
        gl_FragColor = vec4(col * scanline * vignette * (1.0 - edge * 0.3), 1.0);
      }
    `,
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width * 0.38, viewport.height * 0.28]} />
      <primitive object={shader} attach="material" />
    </mesh>
  )
}

function BackgroundMonitorModel() {
  const { viewport } = useThree()
  const scale = viewport.width < 6 ? 0.45 : 0.58

  return (
    <group position={[0, -0.1, -0.3]} scale={scale}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[5.2, 3.1, 0.01]} />
        <meshStandardMaterial color="#d8d8e0" roughness={0.5} metalness={0.05} />
      </mesh>

      <ScreenPlane />

      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[5.35, 3.25, 0.05]} />
        <meshStandardMaterial color="#e8e8ec" roughness={0.3} metalness={0.05} />
      </mesh>

      <mesh position={[0, -1.65, 0.05]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.06, 32]} />
        <meshStandardMaterial color="#d0d0d4" roughness={0.2} metalness={0.6} />
      </mesh>

      <mesh position={[0, -1.15, 0.05]} castShadow>
        <boxGeometry args={[0.18, 1.0, 0.12]} />
        <meshStandardMaterial color="#d0d0d4" roughness={0.2} metalness={0.6} />
      </mesh>

      <mesh position={[0, -0.45, 0.08]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.15, 16]} />
        <meshStandardMaterial color="#d0d0d4" roughness={0.2} metalness={0.6} />
      </mesh>

      <mesh position={[0, -1.62, 0.05]} castShadow>
        <torusGeometry args={[0.56, 0.01, 16, 48]} />
        <meshStandardMaterial color="#aaaab4" roughness={0.2} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function MonitorBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.4, 5], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} color="#ffffff" />
          <directionalLight position={[4, 3, 4]} intensity={0.8} color="#ffffff" />
          <directionalLight position={[-3, 1, -2]} intensity={0.3} color="#e0e0f0" />
          <directionalLight position={[0, -0.5, -3]} intensity={0.15} color="#c8c8d8" />
          <pointLight position={[0, 3, 0]} intensity={0.2} color="#ffffff" distance={10} />
          <BackgroundMonitorModel />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  )
}
