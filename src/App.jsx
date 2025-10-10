import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ width: '100vw', height: '100vh', background: '#111' }}
    >
      <directionalLight position={[1, 1, 2]} intensity={1.2} />
      <ambientLight intensity={0.3} />
      <Ball/>
      <OrbitControls autoRotate />
    </Canvas>
  )
}

function Ball() {
  const ref = useRef()

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#66aaff" roughness={0.4} metalness={0.1} />
    </mesh>
  )
}
