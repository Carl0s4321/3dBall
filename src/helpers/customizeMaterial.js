export default function customizeMaterial(mat, stickerTexture, normalTexture) {
    mat.onBeforeCompile = (shader) => {
        shader.uniforms.stickerMap = { value: stickerTexture };
        shader.uniforms.normalMapSticker = { value: normalTexture };
  
        console.log(shader.uniforms.stickerMap.value === stickerTexture)

        // inject varying UV to fragment
        shader.vertexShader = `
          varying vec2 vUv;
          ${shader.vertexShader.replace(
            "#include <uv_vertex>",
            "vUv = uv;\n#include <uv_vertex>"
          )}
        `;
  
        shader.fragmentShader = `
          uniform sampler2D stickerMap;
          uniform sampler2D normalMapSticker;
          varying vec2 vUv;
          ${shader.fragmentShader}
        `;
  
        // Blend sticker into final color
        shader.fragmentShader = shader.fragmentShader.replace(
          "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
          `
            // vec4 stickerSample = texture2D(stickerMap, vUv);
            // vec4 normalSample = texture2D(normalMapSticker, vUv);
            // vec3 baseColor = outgoingLight;
            // vec3 blended = mix(baseColor, stickerSample.rgb, stickerSample.a);
  
            // // Iridescence on sticker only
            // if (stickerSample.a > 0.01) {
            //   vec3 N = normalize(normal + normalSample.rgb * 0.1 - 0.5);
            //   vec3 V = normalize(vViewPosition);
            //   float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
            //   blended += vec3(fres, fres * 0.3, 1.0 - fres) * 0.3;
            // }
  
            // gl_FragColor = vec4(blended, diffuseColor.a);
            gl_FragColor = texture2D(stickerMap, vUv);

          `
        );
  
        mat.userData.shader = shader;
      };

  }
  