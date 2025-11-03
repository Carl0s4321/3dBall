import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl"

const Ball = () => {

  const mesh = useRef<THREE.Mesh>(null!);
  const [active, setActive] = useState(0)

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uDisp: { value: 0 },
    };
  }, []);

  useEffect(() => {
    console.log(mesh.current.material)
  }, [mesh.current]);


  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;

    let t = uniforms.uTime.value

    uniforms.uDisp.value = THREE.MathUtils.lerp(
      uniforms.uDisp.value,
      active,
      0.05
    );

    mesh.current.position.y = Math.sin(t * .7) * .2

    mesh.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    mesh.current.rotation.y = Math.cos(t * 0.3) * 0.3;
  });

  function handleClick() {
    setActive(1)
    setTimeout(() => {
      setActive(0)
    }, 500);
  }

  return (
    <mesh
      ref={mesh}
      onClick={handleClick}
    >
      <sphereGeometry args={[2, 128, 128]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
      {/* <meshPhongMaterial color={0x202020} wireframe={false} /> */}
    </mesh>
  )
}

export default Ball
