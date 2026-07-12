#version 300 es




precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler2D;
precision highp isampler2D;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
layout(std140) uniform global {
mat4 projectionMatrix;
mat4 viewMatrix;
vec3 cameraPosition;
vec4 cameraQuaternion;
vec2 resolution;
float time;
float timeScale;
};
out vec4 FragColor;



uniform sampler2D tMap;
uniform vec3 uColor;
uniform float uAlpha;
uniform vec2 uMouse;



in vec2 vUv;
in vec3 vWorldPos;



float msdf(vec3 tex, vec2 uv) {
    // TODO: fallback for fwidth for webgl1 (need to enable ext)
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float d = fwidth(signedDist);
    float alpha = smoothstep(-d, d, signedDist);
    if (alpha < 0.01) discard;
    return alpha;
}

float msdf(sampler2D tMap, vec2 uv) {
    vec3 tex = texture(tMap, uv).rgb;
    return msdf( tex, uv );
}

float strokemsdf(sampler2D tMap, vec2 uv, float stroke, float padding) {
    vec3 tex = texture(tMap, uv).rgb;
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float t = stroke;
    float alpha = smoothstep(-t, -t + padding, signedDist) * smoothstep(t, t - padding, signedDist);
    return alpha;
}

void main() {
    float transition = smoothstep(0.3, 0.8, uAlpha);
    float gridV = mix(50.0, 500.0, transition);
    vec2 gridSize = vec2(gridV*3.0, floor(gridV/(resolution.x/resolution.y)));
    vec2 uv = floor(vUv * gridSize) / gridSize;
    uv += (1.0-transition) * (1.0/gridV) * vec2(0.2, 0.5);
    uv = mix(uv, vUv,transition);

    float alpha = msdf(tMap, uv);
    alpha *= uAlpha;

    vec3 color = uColor;
    color = mix(color, vec3(0.5, 0.5, 1.0), 0.1 + sin(time - vWorldPos.x * 0.01 + vWorldPos.y * 0.005 + alpha * 10.0) * 0.1);

    alpha *= 0.9 + sin(time*40.0) * 0.1 * smoothstep(0.2, 0.15, abs(uAlpha-0.5));

    FragColor = vec4(color, alpha);

}