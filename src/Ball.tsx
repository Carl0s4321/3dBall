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

  const texture = new THREE.TextureLoader().load(
    "../src/assets/stickers/sticker1.webp"
  );

  const uniforms = useMemo(() => {
    return {
      baseColor: { value: new THREE.Color(0x202020) },
      uTime: { value: 0 },
      uDisp: { value: 0 },
      map: {
        value: texture,
      },
      projectorMatrix: { value: new THREE.Matrix4() }, // will update on click
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

  //  really good tutorial to get point click projection
  // https://www.youtube.com/watch?v=Zia-0PRgFPc
  const handleClick = (e) => {
    e.stopPropagation();

    setActive(1);
    setTimeout(() => {
      setActive(0);
    }, 500);

    basePosRef.current.copy(new THREE.Vector3(0, 0, 4));

    // raycasted already
    const clickPoint = e.point.clone();
    setTarget(clickPoint);
    setCamActive(1);
    api.start({ zoom: 1 });

    const normal = e.face?.normal.clone().transformDirection(mesh.current.matrixWorld);

    // small offset backwards along normal (away from the surface)
    const offset = normal.clone().multiplyScalar(.8);
    const projPos = clickPoint.clone().add(offset);

    console.log("clickPoint", clickPoint);

    // make a new camera to project the texture from
    const projector = new THREE.PerspectiveCamera(45, 1, 0.01, 3);
    // copy the clickpoint position
    projector.position.copy(projPos);
    // aim it at the mesh center so the texture looks like its sticking to the mesh
    projector.lookAt(clickPoint);

    projector.updateMatrixWorld();
    projector.updateProjectionMatrix();

    // projectorMatrix = projection * view^-1
    const projectorMatrix = new THREE.Matrix4().multiplyMatrices(
      projector.projectionMatrix,
      new THREE.Matrix4().copy(projector.matrixWorld).invert()
    );

    // update uniform
    uniforms.projectorMatrix.value.copy(projectorMatrix);
  };

  // animate cam pos based on click direction
  useFrame(() => {
    if (!camActive) return;

    const basePos = basePosRef.current;

    const direction = new THREE.Vector3()
      .subVectors(target, camera.position)
      .normalize();

    // spring zoom
    // const zoomFactor = springs.zoom.get();
    // camera.position.lerpVectors(
    //   basePos,
    //   basePos.clone().add(direction.multiplyScalar(2.5)),
    //   zoomFactor
    // );
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
