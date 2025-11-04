import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useSpring } from "@react-spring/three";

const Ball = () => {
  const { camera } = useThree();
  const mesh = useRef<THREE.Mesh>(null!);
  const [active, setActive] = useState(0);
  const [camActive, setCamActive] = useState(0);
  const basePosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uDisp: { value: 0 },
    };
  }, []);

  // useEffect(() => {
  //   console.log(mesh.current.material);
  // }, [mesh.current]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;

    let t = uniforms.uTime.value;

    uniforms.uDisp.value = THREE.MathUtils.lerp(
      uniforms.uDisp.value,
      active,
      0.05
    );

    mesh.current.position.y = Math.sin(t * 0.7) * 0.2;

    mesh.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    mesh.current.rotation.y = Math.cos(t * 0.3) * 0.3;
  });

  const [target, setTarget] = useState(new THREE.Vector3());

  const [springs, api] = useSpring(() => ({
    zoom: 0,
    config: { tension: 200, friction: 10 },
  }));

  const handleClick = (e) => {
    e.stopPropagation();

    setActive(1);
    setTimeout(() => {
      setActive(0);
    }, 500);

    basePosRef.current.copy(camera.position);

    const clickPoint = e.point.clone();
    setTarget(clickPoint);
    setCamActive(1);
    api.start({ zoom: 1 });
  };

  // animate cam pos based on click direction
  useFrame(() => {
    if (!camActive) return;

    const basePos = basePosRef.current;

    const direction = new THREE.Vector3()
      .subVectors(target, camera.position)
      .normalize();

    // spring zoom
    const zoomFactor = springs.zoom.get();
    camera.position.lerpVectors(
      basePos,
      basePos.clone().add(direction.multiplyScalar(2.5)),
      zoomFactor
    );
  });

  return (
    <mesh ref={mesh} onClick={handleClick}>
      <sphereGeometry args={[2, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
      {/* <meshPhongMaterial color={0x202020} wireframe={false} /> */}
    </mesh>
  );
};

export default Ball;
