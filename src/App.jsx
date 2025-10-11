import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
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
      <ambientLight intensity={0.3} />

      <directionalLight intensity={1} position={[1, 5, 0]} />

      {/* <Plane scale={10} rotation-x={-Math.PI / 2} position-y={-2} /> */}
      <BlobBall enableOrbitCtrls={enableOrbitCtrls} />
      <OrbitControls ref={orbitCtrlRef} />
    </Canvas>
  );
}
