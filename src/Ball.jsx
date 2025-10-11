import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

export default function BlobBall({ enableOrbitCtrls }) {
  const mesh = useRef();

  const { camera, scene } = useThree();

  // BALL
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 128, 128), []);

  const stickerTexLoader = new THREE.TextureLoader();
  const stickers = [
    stickerTexLoader.load("/stickers/sticker1.webp"),
    stickerTexLoader.load("/stickers/sticker2.webp"),
    stickerTexLoader.load("/stickers/sticker3.webp"),
    stickerTexLoader.load("/stickers/sticker4.webp"),
    stickerTexLoader.load("/stickers/sticker5.webp"),
    stickerTexLoader.load("/stickers/sticker6.webp"),
  ];

  const decals = [];
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const size = new THREE.Vector3();

  const decalMat = new THREE.MeshLambertMaterial({
    transparent: true,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    depthWrite: false,
  });

  function addSticker() {
    const material = decalMat.clone();
    const index = Math.floor(Math.random() * stickers.length);
    material.map = stickers[index];
      position.copy(intersection.point);
    orientation.copy(mouseHelper.rotation);
    orientation.z = Math.random() * 2 * Math.PI;

    const minScale = 1;
    const maxScale = 2;
    const scale = minScale + Math.random() * (maxScale - minScale);
    size.setScalar(scale);

    const decalGeometry = new DecalGeometry(
      mesh.current,
      position,
      orientation,
      size
    );
    const decalMesh = new THREE.Mesh(decalGeometry, material);
    // for no flickering decals
    decalMesh.renderOrder = decals.length;
    decals.push(decalMesh);

    mesh.current.add(decalMesh);
    console.log(`ADDED ${index}`);
  }

  const raycaster = new THREE.Raycaster();

  const mouseHelperGeo = new THREE.ConeGeometry(0.05, 0.25, 16);
  mouseHelperGeo.rotateX(-Math.PI * 0.5);
  mouseHelperGeo.translate(0, 0, 0.5);
  const mouseHelper = new THREE.Mesh(
    mouseHelperGeo,
    new THREE.MeshBasicMaterial()
  );
  scene.add(mouseHelper);

  const intersection = {
    intersects: false,
    point: new THREE.Vector3(),
  };
  const mousePos = new THREE.Vector2();
  let isPointerDown = false;
  //   const intersects = [];

  function handlePointerDown(event) {
    console.log("POINTER DOWN");
    mousePos.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    handleRayCast();
    if (intersection.intersects) {
      enableOrbitCtrls(false);
      addSticker();
      isPointerDown = true;
    }
  }

  function handlePointerUp(event) {
    console.log("POINTER UP");
    enableOrbitCtrls(true);
    isPointerDown = false;
  }
  function handlePointerMove(event) {
    console.log("POINTER MOVE");
    mousePos.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    handleRayCast();
  }

  function handleRayCast() {
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObject(mesh.current);

    if (intersects.length > 0) {
      const p = intersects[0].point;
      mouseHelper.position.copy(p);
      intersection.point.copy(p);

      const normalMatrix = new THREE.Matrix3().getNormalMatrix(
        mesh.current.matrixWorld
      );
      const n = intersects[0].face.normal.clone();
      n.applyNormalMatrix(normalMatrix);
      n.multiplyScalar(5);
      n.add(intersects[0].point);
      mouseHelper.lookAt(n);

      intersection.intersects = true;
      //   reset the array
      intersects.length = 0;
    } else {
      intersection.intersects = false;
    }
  }

  // //   make it breathe
  //   useFrame(({ clock }) => {
  //     const t = clock.getElapsedTime();
  //     mesh.current.scale.setScalar(1 + Math.sin(t * 3) * 0.005);

  //     // mesh.current.rotation.y += 0.01;
  //     // mesh.current.rotation.x += 0.005;
  //   });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <meshBasicMaterial color={0x202020} wireframe={false} />
    </mesh>
  );
}
