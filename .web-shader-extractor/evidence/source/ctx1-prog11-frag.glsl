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


in vec2 vUv;
uniform sampler2D uTexture;
void main () {
    vec3 C = texture(uTexture, vUv).rgb;
    float a = max(C.r, max(C.g, C.b));
    FragColor = vec4(C, a);
}