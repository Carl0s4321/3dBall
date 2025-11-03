import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useHelper } from '@react-three/drei';
import * as THREE from 'three'
import Ball from './Ball';

const App = () => {

    function Lights() {
        const lightRef = useRef<THREE.DirectionalLight>(null!);

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

    return (
        <Canvas camera={{position:[0,0,5]}} style={{ width: "100vw", height: "100vh", background: "#111" }}>
            <Lights />
            <OrbitControls enableRotate={true} />
            <Environment
                files={"../src/assets/textures/env/studio_small_08_4k.exr"}
                background={true}
            />
            <Ball/>
        </Canvas>
    )
}

export default App
