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



uniform vec3 uColor;
uniform float uAlpha;


in vec2 vUv;


void main() {
    vec2 uv = vUv;
    vec3 uvColor = vec3(uv, 1.0);
    FragColor = vec4(mix(uColor, uvColor, 0.0), uAlpha);
}