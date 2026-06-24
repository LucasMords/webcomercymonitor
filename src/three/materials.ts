import * as THREE from 'three'

export function createScreenMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#1e1b4b') },
      uAccent: { value: new THREE.Color('#6366f1') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      void main() {
        float scanline = sin(vUv.y * 200.0 + uTime * 0.5) * 0.03 + 0.97;
        float vignette = 1.0 - length(vUv - 0.5) * 0.6;
        vec3 color = mix(uColor, uAccent, sin(vUv.y * 3.0 + uTime * 0.2) * 0.15 + 0.5);
        vec3 finalColor = color * scanline * vignette;
        float border = smoothstep(0.0, 0.02, vUv.x) * smoothstep(1.0, 0.98, vUv.x)
                      * smoothstep(0.0, 0.02, vUv.y) * smoothstep(1.0, 0.98, vUv.y);
        finalColor += vec3(0.05) * (1.0 - border);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  })
}

export function createBodyMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.5,
  })
}

export function createStandMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1a1a'),
    metalness: 0.8,
    roughness: 0.2,
  })
}

export function createBaseMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#222222'),
    metalness: 0.9,
    roughness: 0.15,
  })
}
