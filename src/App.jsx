import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useHelper } from "@react-three/drei";
import BlobBall from "./Ball";
import { Suspense, useRef } from "react";
import * as THREE from "three";

export default function App() {
  const orbitCtrlRef = useRef();

  function Lights() {
    const lightRef = useRef();

    useHelper(lightRef, THREE.DirectionalLightHelper, 1, "red");

    return (
      <>
        <ambientLight intensity={1.2} />

        <directionalLight ref={lightRef} intensity={3} position={[-2, 4, -3]} />
        <directionalLight
          ref={lightRef}
          intensity={2}
          position={[200, -50, 10]}
        />
        <directionalLight
          ref={lightRef}
          intensity={0.3}
          position={[-2, 4, 100]}
        />
      </>
    );
  }

  function enableOrbitCtrls(isEnabled) {
    console.log(`enableOrbitCtrls : ${isEnabled}`);
    if (orbitCtrlRef.current) {
      orbitCtrlRef.current.enabled = isEnabled;
    }
  }
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", background: "#111" }}
      camera={{ position: [0, 0, 4] }}
    >
      <Suspense>
        <Lights />
        <OrbitControls ref={orbitCtrlRef} enableRotate={true} />
        <BlobBall />

        <Environment
          files={"/textures/env/studio_small_08_4k.exr"}
          background={true}
        />
        {/* <BlobBall enableOrbitCtrls={enableOrbitCtrls} /> */}
      </Suspense>
    </Canvas>
  );
}
