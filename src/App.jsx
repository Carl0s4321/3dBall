import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane, TorusKnot } from "@react-three/drei";
import BlobBall from "./Ball";
import { useRef } from "react";

export default function App() {
  const orbitCtrlRef = useRef();

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
      <ambientLight intensity={0.2} />

      {/* Light from top-left */}
      <directionalLight
        position={[-2.3, 2, 3]}
        intensity={1}
        color="#ffffff"
      />

      <spotLight position={[-2.3, 2, 3]} intensity={1.5} color="#ffffff" />

      <spotLight
        position={[-2, 0.3, -1]}
        intensity={5}
        distance={5}
        color="#ffd6e0"
      />

      {/* <Plane scale={10} rotation-x={-Math.PI / 2} position-y={-2} /> */}
      <BlobBall enableOrbitCtrls={enableOrbitCtrls} />
      <OrbitControls ref={orbitCtrlRef} />
    </Canvas>
  );
}
