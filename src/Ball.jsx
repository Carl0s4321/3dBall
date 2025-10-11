import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

export default function BlobBall() {
  const mesh = useRef();

  const { camera, scene } = useThree();

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 128, 128), []);

  const stickerTexLoader = new THREE.TextureLoader();
  const stickers = [
    stickerTexLoader.load("/sticker1.webp"),
    stickerTexLoader.load("/sticker2.webp"),
    stickerTexLoader.load("/sticker3.webp"),
    stickerTexLoader.load("/sticker4.webp"),
    stickerTexLoader.load("/sticker5.webp"),
    stickerTexLoader.load("/sticker6.webp"),
  ];

  const decals = [];

  const decalMat = new THREE.MeshLambertMaterial({
    transparent: true,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    depthWrite: false,
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const mouseHelperGeo = new THREE.ConeGeometry(0.05, 0.25, 16);
  mouseHelperGeo.rotateX(-Math.PI * 0.5);
  mouseHelperGeo.translate(0, 0, 0.5);

  function handleClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(mesh.current);
    if (!intersects.length) return;

    const { point, face } = intersects[0];
    const normal = face.normal
      .clone()
      .transformDirection(mesh.current.matrixWorld);

    addSticker(point, normal);
  }

  function addSticker(point, normal) {
    const decalGeometry = new DecalGeometry(
      mesh.current,
      point,
      normal,
      new THREE.Vector3(0.3, 0.3, 0.3)
    );

    const index = Math.floor(Math.random() * stickers.length);

    const material = new THREE.MeshStandardMaterial({
      map: stickers[index],
      transparent: true,
      depthWrite: false,
    });

    const decalMesh = new THREE.Mesh(decalGeometry, material);
    mesh.current.attach(decalMesh);
    console.log(`ADDED ${index}`);
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    mesh.current.scale.setScalar(1 + Math.sin(t * 3) * 0.005);

    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.x += 0.005;
  });

  return (
    <mesh ref={mesh} geometry={geometry} onClick={handleClick}>
      <meshStandardMaterial color="#0f0f0f" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}
