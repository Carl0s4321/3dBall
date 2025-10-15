export const vertexShader =
`
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
`