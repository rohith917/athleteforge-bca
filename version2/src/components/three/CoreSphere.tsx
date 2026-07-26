import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'

function DistortSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08
  })
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 12]} />
        <MeshDistortMaterial
          color="#b11226"
          emissive="#590a12"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.6}
          distort={0.35}
          speed={1.6}
        />
      </mesh>
    </Float>
  )
}

function Ring({ radius, rotation }: { radius: number; rotation: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.getElapsedTime() * 0.15
  })
  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.006, 16, 100]} />
      <meshBasicMaterial color="#d7263d" transparent opacity={0.4} />
    </mesh>
  )
}

/** Draggable 3D "AI core" — an emissive, distorting sphere the visitor
 * can orbit by dragging, ringed by two slowly counter-rotating torus
 * rings. This is the section's dedicated interactive 3D moment. */
export function CoreSphere() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 4]} intensity={2} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} intensity={1.2} color="#d7263d" />
        <DistortSphere />
        <Ring radius={2.4} rotation={[Math.PI / 2.2, 0, 0]} />
        <Ring radius={2.9} rotation={[Math.PI / 2.6, Math.PI / 4, 0]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 3}
        />
      </Suspense>
    </Canvas>
  )
}
