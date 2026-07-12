#version 300 es


precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler2D;
precision highp isampler2D;
in vec2 uv;
in vec3 position;
in vec3 normal;
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





uniform vec3 uColor;
uniform float uAlpha;
uniform float uScroll;
uniform float uScrollDelta;
uniform float uBottom;
uniform float uDisabled;
uniform float uHeight;
uniform vec3 uUIColor;
uniform float uUIBlend;


out vec2 vUv;
out vec3 vPos;
out vec3 vWorldPos;



void main() {
    vUv = uv;
    vPos = position;
    vWorldPos = vec3(modelMatrix * vec4(position, 1.0));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}