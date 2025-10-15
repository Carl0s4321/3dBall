export const fragmentShader =
    ` uniform sampler2D baseMap;
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
        }`