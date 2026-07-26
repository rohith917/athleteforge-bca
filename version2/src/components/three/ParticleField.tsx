import { useMemo, useRef } from 'react'
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 1800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 18
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    return arr
  }, [count])

  useMemo(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.02 + mouse.current.x * 0.15
      pointsRef.current.rotation.x = mouse.current.y * 0.08
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#d7263d"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function GlowSphere(props: ThreeElements['mesh']) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.position.y = Math.sin(t * 0.4) * 0.4
    ref.current.rotation.z = t * 0.05
  })
  return (
    <mesh ref={ref} {...props}>
      <icosahedronGeometry args={[1.4, 4]} />
      <meshBasicMaterial color="#b11226" wireframe transparent opacity={0.12} />
    </mesh>
  )
}

/** Full-bleed WebGL background: drifting particle field + a slow wireframe
 * form, both reacting subtly to the mouse. Sits behind the hero copy. */
export function ParticleField() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <Particles />
      <GlowSphere position={[2.6, 0.4, -1]} scale={1.1} />
      <GlowSphere position={[-3, -0.8, -2]} scale={0.7} />
    </Canvas>
  )
}
