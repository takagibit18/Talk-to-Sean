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


uniform sampler2D tOrigin;
uniform sampler2D tAttribs;
uniform float uMaxCount;
uniform float uMouseStrength;
uniform float HZ;
uniform sampler2D tPointCloud;
uniform mat4 uProjMatrix;
uniform mat4 uProjNormalMatrix;
uniform mat4 uModelMatrix;
uniform sampler2D tFluidMask;
uniform sampler2D tFluid;
//uniforms



float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    vec3 sub = vec3(oldValue, newMax, oldMax) - vec3(oldMin, newMin, oldMin);
    return sub.x * sub.y / sub.z + newMin;
}

vec2 range(vec2 oldValue, vec2 oldMin, vec2 oldMax, vec2 newMin, vec2 newMax) {
    vec2 oldRange = oldMax - oldMin;
    vec2 newRange = newMax - newMin;
    vec2 val = oldValue - oldMin;
    return val * newRange / oldRange + newMin;
}

vec3 range(vec3 oldValue, vec3 oldMin, vec3 oldMax, vec3 newMin, vec3 newMax) {
    vec3 oldRange = oldMax - oldMin;
    vec3 newRange = newMax - newMin;
    vec3 val = oldValue - oldMin;
    return val * newRange / oldRange + newMin;
}

float crange(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMin, newMax), max(newMin, newMax));
}

vec2 crange(vec2 oldValue, vec2 oldMin, vec2 oldMax, vec2 newMin, vec2 newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMin, newMax), max(newMin, newMax));
}

vec3 crange(vec3 oldValue, vec3 oldMin, vec3 oldMax, vec3 newMin, vec3 newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMin, newMax), max(newMin, newMax));
}

float rangeTransition(float t, float x, float padding) {
    float transition = crange(t, 0.0, 1.0, -padding, 1.0 + padding);
    return crange(x, transition - padding, transition + padding, 1.0, 0.0);
}

vec2 frag_coord(vec4 glPos) {
    return ((glPos.xyz / glPos.w) * 0.5 + 0.5).xy;
}

vec2 getProjection(vec3 pos, mat4 projMatrix) {
    vec4 mvpPos = projMatrix * vec4(pos, 1.0);
    return frag_coord(mvpPos);
}

void applyNormal(inout vec3 pos, mat4 projNormalMatrix) {
    vec3 transformed = vec3(projNormalMatrix * vec4(pos, 0.0));
    pos = transformed;
}
//requires

uniform sampler2D tInput;
uniform float fSize;
in vec2 vUv;
vec3 getData(sampler2D tex, vec2 uv) {
    return texture(tex, uv).xyz;
}

vec4 getData4(sampler2D tex, vec2 uv) {
    return texture(tex, uv);
}

void main() {
    vec2 uv = vUv;
        uv = gl_FragCoord.xy / fSize;
    

    vec3 origin = texture(tOrigin, uv).xyz;
    vec4 inputData = texture(tInput, uv);
    vec3 pos = inputData.xyz;
    vec4 random = texture(tAttribs, uv);
    float data = inputData.w;

    if (vUv.x + vUv.y * fSize > uMaxCount) {
        FragColor = vec4(9999.0);
        return;
    }

    vec3 pointShape = texture(tPointCloud, uv).xyz;
vec3 target = pointShape;

vec3 mpos = vec3(uModelMatrix * vec4(pos, 1.0));
vec2 screenUV = getProjection(mpos, uProjMatrix);
vec3 flow = vec3(texture(tFluid, screenUV).xy, 0.0);
applyNormal(flow, uProjNormalMatrix);
target += flow * 0.0001 * HZ * uMouseStrength * texture(tFluidMask, screenUV).r;

pos += (target - pos) * 0.07 * HZ;
//code

    FragColor = vec4(pos, data);
}