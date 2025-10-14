import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

export default function BlobBall({ enableOrbitCtrls }) {
  const mesh = useRef();

  const { camera, scene } = useThree();

  // BALL
  const geometry = useMemo(() => new THREE.SphereGeometry(2, 128, 128), []);

  const stickerTexLoader = new THREE.TextureLoader();
  const stickers = [
    stickerTexLoader.load("/stickers/sticker1.webp"),
    stickerTexLoader.load("/stickers/sticker2.webp"),
    stickerTexLoader.load("/stickers/sticker3.webp"),
    stickerTexLoader.load("/stickers/sticker4.webp"),
    stickerTexLoader.load("/stickers/sticker5.webp"),
    stickerTexLoader.load("/stickers/sticker6.webp"),
  ];

  const wrinkleTex = new THREE.TextureLoader().load("/stickers/wrinkle.webp");

  // const decalMat = new THREE.MeshStandardMaterial({
  //   transparent: true,
  //   depthTest: true,
  //   polygonOffset: true,
  //   polygonOffsetFactor: -4,
  //   depthWrite: false,
  // });

  function createHoloShaderMat(stickerTexture, wrinkleTex) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      uniforms: {
        baseMap: { value: stickerTexture },
        maskMap: { value: wrinkleTex },
        // gonna update this each frame for the shine
        cameraPos: { value: new THREE.Vector3() },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
  
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D baseMap;
        uniform sampler2D maskMap;
        uniform vec3 cameraPos;
  
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
  
        void main() {
          vec4 baseColor = texture2D(baseMap, vUv);
          float mask = texture2D(maskMap, vUv).r;
  
          // getting view direction
          vec3 viewDir = normalize(cameraPos - vWorldPos);
  
          // angle between normal and view direction
          float fresnel = pow(1.0 - dot(viewDir, vWorldNormal), 3.0);
  
          // using that angle to create a rainbow
          float angle = dot(normalize(vWorldNormal), normalize(vec3(0.0, 1.0, 0.5))) * 10.0;
          vec3 rainbow = vec3(
            0.5 + 0.5 * sin(angle),
            0.5 + 0.5 * sin(angle + 2.094),
            0.5 + 0.5 * sin(angle + 4.188)
          );
  
          // combine base + rainbow for the wrinkles
          vec3 color = mix(baseColor.rgb, rainbow * 1.6, mask * pow(fresnel, 0.7) * 1.2);

          // extra glint maybe???
          vec3 reflection = normalize(reflect(-viewDir, vWorldNormal));
          float highlight = pow(max(dot(reflection, vec3(0.0, 0.0, 1.0)), 0.0), 10.0);
          color += rainbow * highlight * 0.3;

          gl_FragColor = vec4(color, baseColor.a);
        }
      `,
    });
  }

  const decals = [];
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const size = new THREE.Vector3();

  function addSticker() {
    const index = Math.floor(Math.random() * stickers.length);
    const stickerTexture = stickers[index];
    const material = createHoloShaderMat(stickerTexture, wrinkleTex);

    position.copy(intersection.point);
    orientation.copy(mouseHelper.rotation);
    orientation.z = Math.random() * 2 * Math.PI;

    const minScale = 0.5;
    const maxScale = 1;
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

    mesh.current.attach(decalMesh);
    // console.log(`ADDED ${index}`);
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
    // console.log("POINTER DOWN");
    mousePos.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    handleRayCast();
    if (intersection.intersects) {
      enableOrbitCtrls?.(false);
      addSticker();
      isPointerDown = true;
    }
  }

  function handlePointerUp(event) {
    // console.log("POINTER UP");
    enableOrbitCtrls?.(true);
    isPointerDown = false;
  }
  function handlePointerMove(event) {
    // console.log("POINTER MOVE");
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

    const color = new THREE.Color();

  useFrame(({ camera }) => {
    for (const sticker of decals) {
      // console.log(sticker)
      if (sticker.material.uniforms.cameraPos) {
        sticker.material.uniforms.cameraPos.value.copy(camera.position);
      }
    }
  });

  // //   make it breathe
  // useFrame(({ clock }) => {
  //   const t = clock.getElapsedTime();
  //   mesh.current.scale.setScalar(1 + Math.sin(t * 3) * 0.005);
  //   const pulse = Math.abs(Math.sin(t));

  //   mesh.current.rotation.y += 0.001;
  //   mesh.current.position.y = Math.cos(t) * 0.2;

  //   // console.log(t);
  // switching color black to orangey in a pulse
  //   mesh.current.material.color.copy(
  //     color.setRGB(0.05 * pulse, 0.01 * pulse, 0)
  //   );
  //   //   mesh.current.rotation.x += 0.005;
  // });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <meshPhongMaterial color={0x202020} wireframe={false} />
    </mesh>
  );
}
