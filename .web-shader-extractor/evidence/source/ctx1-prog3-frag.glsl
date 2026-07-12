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
uniform float uScroll;
uniform float uScrollDelta;
uniform float uBottom;
uniform float uDisabled;
uniform float uHeight;
uniform vec3 uUIColor;
uniform float uUIBlend;


in vec2 vUv;
in vec3 vPos;
in vec3 vWorldPos;



vec2 translateUV(vec2 uv, vec2 translate) {
    return uv - translate;
}

vec2 rotateUV(vec2 uv, float r, vec2 origin) {
    float c = cos(r);
    float s = sin(r);
    mat2 m = mat2(c, -s,
                  s, c);
    vec2 st = uv - origin;
    st = m * st;
    return st + origin;
}

vec2 scaleUV(vec2 uv, vec2 scale, vec2 origin) {
    vec2 st = uv - origin;
    st /= scale;
    return st + origin;
}

vec2 rotateUV(vec2 uv, float r) {
    return rotateUV(uv, r, vec2(0.5));
}

vec2 scaleUV(vec2 uv, vec2 scale) {
    return scaleUV(uv, scale, vec2(0.5));
}

vec2 skewUV(vec2 st, vec2 skew) {
    return st + st.gr * skew;
}

vec2 transformUV(vec2 uv, float a[9]) {

    // Array consists of the following
    // 0 translate.x
    // 1 translate.y
    // 2 skew.x
    // 3 skew.y
    // 4 rotate
    // 5 scale.x
    // 6 scale.y
    // 7 origin.x
    // 8 origin.y

    vec2 st = uv;

    //Translate
    st -= vec2(a[0], a[1]);

    //Skew
    st = st + st.gr * vec2(a[2], a[3]);

    //Rotate
    st = rotateUV(st, a[4], vec2(a[7], a[8]));

    //Scale
    st = scaleUV(st, vec2(a[5], a[6]), vec2(a[7], a[8]));

    return st;
}
float getNoise(vec2 uv, float time) {
    float x = uv.x * uv.y * time * 1000.0;
    x = mod(x, 13.0) * mod(x, 123.0);
    float dx = mod(x, 0.01);
    float amount = clamp(0.1 + dx * 100.0, 0.0, 1.0);
    return amount;
}



    #define sinf sin


highp float getRandom(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy, vec2(a, b));
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

float cnoise(vec3 v) {
    float t = v.z * 0.3;
    v.y *= 0.8;
    float noise = 0.0;
    float s = 0.5;
    noise += (sinf(v.x * 0.9 / s + t * 10.0) + sinf(v.x * 2.4 / s + t * 15.0) + sinf(v.x * -3.5 / s + t * 4.0) + sinf(v.x * -2.5 / s + t * 7.1)) * 0.3;
    noise += (sinf(v.y * -0.3 / s + t * 18.0) + sinf(v.y * 1.6 / s + t * 18.0) + sinf(v.y * 2.6 / s + t * 8.0) + sinf(v.y * -2.6 / s + t * 4.5)) * 0.3;
    return noise;
}

float cnoise(vec2 v) {
    float t = v.x * 0.3;
    v.y *= 0.8;
    float noise = 0.0;
    float s = 0.5;
    noise += (sinf(v.x * 0.9 / s + t * 10.0) + sinf(v.x * 2.4 / s + t * 15.0) + sinf(v.x * -3.5 / s + t * 4.0) + sinf(v.x * -2.5 / s + t * 7.1)) * 0.3;
    noise += (sinf(v.y * -0.3 / s + t * 18.0) + sinf(v.y * 1.6 / s + t * 18.0) + sinf(v.y * 2.6 / s + t * 8.0) + sinf(v.y * -2.6 / s + t * 4.5)) * 0.3;
    return noise;
}

float fbm(vec3 x, int octaves) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100);

    for (int i = 0; i < 10; ++i) {
        if (i >= octaves){ break; }

        v += a * cnoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }

    return v;
}

float fbm(vec2 x, int octaves) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));

    for (int i = 0; i < 10; ++i) {
        if (i >= octaves){ break; }

        v += a * cnoise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }

    return v;
}



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

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float innerRoundedRectangle(vec2 p, vec2 size, float radius, float stepper) {
    vec2 q = abs(p) - size + radius;
    return step(stepper, length(max(q, 0.0)) - radius);
}

void main() {
    vec2 uv = vUv;
    vec4 color = vec4(0.0);

    //float innerClip = step(0.4, abs(uv.x-0.5));
    //innerClip = max(innerClip, step(0.3, abs(uv.y-0.5)));
    
    vec2 innerUV = uv;
    innerUV.y += smoothstep(1.1, 0.0, abs(uv.x-0.5)) * 0.03 * uScrollDelta;

    //innerUV += cnoise(uv*2.0+time*0.2) * 0.01;
    vec2 innerScale = vec2(0.7, uHeight);
    vec2 innerOffset = vec2(1.0, 1.0 + uScrollDelta * 0.03);
    float innerClip = innerRoundedRectangle(scaleUV(innerUV, vec2(0.5, 0.5), innerOffset), innerScale, innerScale.y, 0.0);
    float innerClip2 = innerRoundedRectangle(scaleUV(innerUV, vec2(0.5, 0.5), innerOffset), innerScale, innerScale.y, 0.01);

    vec2 bgUV = scaleUV(innerUV, vec2(1.0, 0.4), vec2(1.0, mix(0.45, 0.57, uBottom) + uScrollDelta * 0.025));

    vec3 rainbow = vec3(0.65, 1.0, 0.9);
    rainbow = rgb2hsv(rainbow);
    rainbow.x += cnoise(-bgUV*0.5-bgUV.y*0.5-time*0.05-uScroll*0.3+length(bgUV-0.2)*0.2) * 0.2;
    rainbow = hsv2rgb(rainbow);

    rainbow = mix(rainbow, mix(uUIColor * 1.2, vec3(1.0), 0.2), uUIBlend * 0.8);

    color = mix(color, vec4(rainbow, 0.5), smoothstep(0.65, abs(uScrollDelta * 0.02) - 0.2, length(bgUV-0.5)));
    color = mix(color, vec4(rainbow, 0.8), smoothstep(0.25, 0.0, length(bgUV-0.5)));
    color = mix(color, vec4(rainbow, 0.3 + abs(uScrollDelta * 0.08)), 1.0-innerClip2);

    vec4 inner = vec4(uColor, 0.7);
    vec2 barUV = scaleUV(vUv, vec2(1.0, 1.0));
    barUV.y -= uScroll * 0.2 - time * 0.02;
    float bars = sin(barUV.x * 500.0) * cnoise(barUV*30.0 + time * 0.2 + abs(barUV.y-0.5) * 4.0);
    color += vec4(mix(rainbow, vec3(1.0), 0.5), step(0.9, bars)) * (abs(uScrollDelta) * 0.05 + 0.2) * innerClip2 * smoothstep(0.7, 0.2, length(bgUV-0.5));

    color = mix(color, inner, 1.0-innerClip);
    color.a *= mix(1.0, 0.1, uDisabled);

    FragColor = color;
    FragColor.a *= uAlpha;
}