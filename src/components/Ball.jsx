import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import customizeMaterial from "../helpers/customizeMaterial";

export default function StickerBall() {
  const meshRef = useRef(null);
  const { gl } = useThree();

  const { stickerColorTex, stickerNormalTex, colorCtx, normalCtx } =
    useMemo(() => {
      const size = { w: 2048, h: 1024 };

      // Offscreen canvas for color (sticker images)
      const colorCanvas = document.createElement("canvas");
      colorCanvas.width = size.w;
      colorCanvas.height = size.h;
      const colorCtx = colorCanvas.getContext("2d");
      colorCtx.fillStyle = "#ffffff";
      colorCtx.fillRect(0, 0, size.w, size.h);
      const stickerColorTex = new THREE.CanvasTexture(colorCanvas);

      document.body.appendChild(colorCanvas)
      // Offscreen canvas for normal map (wrinkle)
      const normalCanvas = document.createElement("canvas");
      normalCanvas.width = size.w;
      normalCanvas.height = size.h;
      const normalCtx = normalCanvas.getContext("2d");
      normalCtx.fillStyle = "rgb(128,128,255)"; // flat normal
      normalCtx.fillRect(0, 0, size.w, size.h);
      const stickerNormalTex = new THREE.CanvasTexture(normalCanvas);

      return { stickerColorTex, stickerNormalTex, colorCtx, normalCtx };
    }, [gl]);

  // BALL MATERIAL
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
        color: "#000000",
    //   map: null, // base map optional
      roughness: 0.5,
      metalness: 0.2,
    //   clearcoat: 0.4,
    //   iridescence: 0.7,
    });
    customizeMaterial(mat, stickerColorTex, stickerNormalTex);
    return mat;
  }, [stickerColorTex, stickerNormalTex]);

  // --- On click: add new sticker + update shader uniforms ---
  const handleClick = (e) => {
    e.stopPropagation();
    const uv = e.uv;
    if (!uv) return;

    console.log("Clicking")
    const size = 150; // sticker size in pixels
    const x = uv.x * stickerColorTex.image.width;
    const y = (1 - uv.y) * stickerColorTex.image.height;

    // select random sticker image
    const stickers = [
        "/stickers/sticker1.webp",
        "/stickers/sticker2.webp",
        "/stickers/sticker3.webp",
        "/stickers/sticker4.webp",
        "/stickers/sticker5.webp",
        "/stickers/sticker6.webp",
    ];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = stickers[Math.floor(Math.random() * stickers.length)];

    img.onload = () => {
      // draw sticker to color canvas
      colorCtx.drawImage(img, x - size / 2, y - size / 2, size, size);
      stickerColorTex.needsUpdate = true;

      // draw wrinkle to normal canvas
      const grad = normalCtx.createRadialGradient(x, y, 0, x, y, size / 2);
      grad.addColorStop(0, "rgb(128,128,255)");
      grad.addColorStop(1, "rgb(118,118,245)");
      normalCtx.fillStyle = grad;
      normalCtx.beginPath();
      normalCtx.arc(x, y, size / 2, 0, Math.PI * 2);
      normalCtx.fill();
      stickerNormalTex.needsUpdate = true;
    };
  };

  return (
    <mesh ref={meshRef} material={material} onClick={handleClick}>
      <sphereGeometry args={[1, 128, 128]} />
    </mesh>
  );
}
