varying vec2 vUv;

uniform sampler2D map;
varying vec4 vProjPosition;

uniform vec3 baseColor;
uniform mat4 projectorMatrix;
varying vec3 vNormal;

void main() {

// we have to transform the position from world space into clip space.
  vec3 proj = vProjPosition.xyz / vProjPosition.w;

// convert from NDC [-1,1] to [0,1]
  vec2 uv = proj.xy * 0.5 + 0.5; 

// direction from projector to fragment
  vec3 projectorDir = normalize(proj);
  float facing = dot(vNormal, projectorDir);

 // check if within projection
  if( facing < 0. ||  uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    // base color
    gl_FragColor = vec4(baseColor, 1.0);
  } else {
    vec4 projected = texture2D(map, uv);
    // blend projection with base color
    gl_FragColor = mix(vec4(baseColor, 1.0), projected, projected.a);
  }
}
