import * as THREE from 'three'

export function createLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight('#404060', 0.6)
  scene.add(ambient)

  const key = new THREE.DirectionalLight('#ffffff', 1.2)
  key.position.set(5, 3, 5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 50
  scene.add(key)

  const fill = new THREE.DirectionalLight('#6366f1', 0.4)
  fill.position.set(-3, 1, -2)
  scene.add(fill)

  const rim = new THREE.DirectionalLight('#818cf8', 0.3)
  rim.position.set(0, -0.5, -3)
  scene.add(rim)

  const top = new THREE.PointLight('#a78bfa', 0.3, 8)
  top.position.set(0, 4, 0)
  scene.add(top)

  return { ambient, key, fill, rim, top }
}
