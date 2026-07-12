// GLSL source strings for the 2-pass fluid cursor simulation.
// Curl noise ported from activetheory.net captured WebGL2 shader (SOURCE evidence).
// All shaders use #version 300 es (WebGL2).

export const FULLSCREEN_VERT = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// ── Curl noise pass ──────────────────────────────────────────────────────────
// Ported from ctx1-prog15-frag.glsl analytic curl noise (Bridson 2007).
// 3 potential functions → 6 analytic partial derivatives → curl.
// 36 trig calls total vs 96 in the finite-difference approximation.

export const CURL_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 FragColor;

uniform float uTime;
uniform float uCurlScale;
uniform float uCurlSpeed;

#define sinf2 sin
#define cosf2 cos

float potential1(vec3 v) {
    float noise = 0.0;
    noise += sinf2(v.x * 1.8 + v.z * 3.) + sinf2(v.x * 4.8 + v.z * 4.5) + sinf2(v.x * -7.0 + v.z * 1.2) + sinf2(v.x * -5.0 + v.z * 2.13);
    noise += sinf2(v.y * -0.48 + v.z * 5.4) + sinf2(v.y * 2.56 + v.z * 5.4) + sinf2(v.y * 4.16 + v.z * 2.4) + sinf2(v.y * -4.16 + v.z * 1.35);
    return noise;
}

float potential2(vec3 v) {
    float noise = 0.0;
    noise += sinf2(v.y * 1.8 + v.x * 3. - 2.82) + sinf2(v.y * 4.8 + v.x * 4.5 + 74.37) + sinf2(v.y * -7.0 + v.x * 1.2 - 256.72) + sinf2(v.y * -5.0 + v.x * 2.13 - 207.683);
    noise += sinf2(v.z * -0.48 + v.x * 5.4 -125.796) + sinf2(v.z * 2.56 + v.x * 5.4 + 17.692) + sinf2(v.z * 4.16 + v.x * 2.4 + 150.512) + sinf2(v.z * -4.16 + v.x * 1.35 - 222.137);
    return noise;
}

float potential3(vec3 v) {
    float noise = 0.0;
    noise += sinf2(v.z * 1.8 + v.y * 3. - 194.58) + sinf2(v.z * 4.8 + v.y * 4.5 - 83.13) + sinf2(v.z * -7.0 + v.y * 1.2 -845.2) + sinf2(v.z * -5.0 + v.y * 2.13 - 762.185);
    noise += sinf2(v.x * -0.48 + v.y * 5.4 - 707.916) + sinf2(v.x * 2.56 + v.y * 5.4 + -482.348) + sinf2(v.x * 4.16 + v.y * 2.4 + 9.872) + sinf2(v.x * -4.16 + v.y * 1.35 - 476.747);
    return noise;
}

float dP3dY(vec3 v) {
    float noise = 0.0;
    noise += 3. * cosf2(v.z * 1.8 + v.y * 3. - 194.58) + 4.5 * cosf2(v.z * 4.8 + v.y * 4.5 - 83.13) + 1.2 * cosf2(v.z * -7.0 + v.y * 1.2 -845.2) + 2.13 * cosf2(v.z * -5.0 + v.y * 2.13 - 762.185);
    noise += 5.4 * cosf2(v.x * -0.48 + v.y * 5.4 - 707.916) + 5.4 * cosf2(v.x * 2.56 + v.y * 5.4 + -482.348) + 2.4 * cosf2(v.x * 4.16 + v.y * 2.4 + 9.872) + 1.35 * cosf2(v.x * -4.16 + v.y * 1.35 - 476.747);
    return noise;
}

float dP2dZ(vec3 v) {
    return -0.48 * cosf2(v.z * -0.48 + v.x * 5.4 -125.796) + 2.56 * cosf2(v.z * 2.56 + v.x * 5.4 + 17.692) + 4.16 * cosf2(v.z * 4.16 + v.x * 2.4 + 150.512) -4.16 * cosf2(v.z * -4.16 + v.x * 1.35 - 222.137);
}

float dP1dZ(vec3 v) {
    float noise = 0.0;
    noise += 3. * cosf2(v.x * 1.8 + v.z * 3.) + 4.5 * cosf2(v.x * 4.8 + v.z * 4.5) + 1.2 * cosf2(v.x * -7.0 + v.z * 1.2) + 2.13 * cosf2(v.x * -5.0 + v.z * 2.13);
    noise += 5.4 * cosf2(v.y * -0.48 + v.z * 5.4) + 5.4 * cosf2(v.y * 2.56 + v.z * 5.4) + 2.4 * cosf2(v.y * 4.16 + v.z * 2.4) + 1.35 * cosf2(v.y * -4.16 + v.z * 1.35);
    return noise;
}

float dP3dX(vec3 v) {
    return -0.48 * cosf2(v.x * -0.48 + v.y * 5.4 - 707.916) + 2.56 * cosf2(v.x * 2.56 + v.y * 5.4 + -482.348) + 4.16 * cosf2(v.x * 4.16 + v.y * 2.4 + 9.872) -4.16 * cosf2(v.x * -4.16 + v.y * 1.35 - 476.747);
}

float dP2dX(vec3 v) {
    float noise = 0.0;
    noise += 3. * cosf2(v.y * 1.8 + v.x * 3. - 2.82) + 4.5 * cosf2(v.y * 4.8 + v.x * 4.5 + 74.37) + 1.2 * cosf2(v.y * -7.0 + v.x * 1.2 - 256.72) + 2.13 * cosf2(v.y * -5.0 + v.x * 2.13 - 207.683);
    noise += 5.4 * cosf2(v.z * -0.48 + v.x * 5.4 -125.796) + 5.4 * cosf2(v.z * 2.56 + v.x * 5.4 + 17.692) + 2.4 * cosf2(v.z * 4.16 + v.x * 2.4 + 150.512) + 1.35 * cosf2(v.z * -4.16 + v.x * 1.35 - 222.137);
    return noise;
}

float dP1dY(vec3 v) {
    return -0.48 * cosf2(v.y * -0.48 + v.z * 5.4) + 2.56 * cosf2(v.y * 2.56 + v.z * 5.4) + 4.16 * cosf2(v.y * 4.16 + v.z * 2.4) -4.16 * cosf2(v.y * -4.16 + v.z * 1.35);
}

vec3 curlNoise(vec3 p) {
    // Analytic curl noise: 36 trig calls vs 96 for finite-difference approx.
    // Based on Bridson 2007 (curl noise for fluid simulation).
    float x = dP3dY(p) - dP2dZ(p);
    float y = dP1dZ(p) - dP3dX(p);
    float z = dP2dX(p) - dP1dY(p);
    return normalize(vec3(x, y, z));
}

void main() {
    // Evaluate 3D curl noise: xy = spatial via UVs, z = time-driven
    vec3 p = vec3(vUv * uCurlScale, uTime * uCurlSpeed * 0.1);
    vec3 curl = curlNoise(p);
    // Pack signed force xy into [0,1] range for texture storage
    FragColor = vec4(curl.xy * 0.5 + 0.5, 0.0, 1.0);
}`;

// ── Mouse splat pass ────────────────────────────────────────────────────────
// Inspired by prog12-frag.glsl: cubic ease-out splat between prev/current UV.
// Screen blend via framebuffer blending (GL_ONE, GL_ONE_MINUS_SRC_COLOR).
// Aspect-ratio corrected line segment distance for trail rendering.

export const SPLAT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 FragColor;

uniform vec2 uMouseUV;
uniform vec2 uPrevMouseUV;
uniform float uMouseVelocity;
uniform float uRadius;
uniform float uAspectRatio;

float cubicOut(float t) {
    float f = t - 1.0;
    return f * f * f + 1.0;
}

float lineDist(vec2 uv, vec2 p0, vec2 p1) {
    vec2 pa = uv - p0, ba = p1 - p0;
    pa.x *= uAspectRatio;
    ba.x *= uAspectRatio;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    float dist = lineDist(vUv, uPrevMouseUV, uMouseUV);
    float falloff = 1.0 - cubicOut(clamp(dist / uRadius, 0.0, 1.0));
    float energy = falloff * clamp(uMouseVelocity * 2.0, 0.0, 1.0);
    FragColor = vec4(vec3(energy), 1.0);
}`;

// ── Advection pass ──────────────────────────────────────────────────────────
// Semi-Lagrangian advection: trace backward along velocity field.
// All velocity textures store PACKED signed values: packed = signed * 0.5 + 0.5
// Neutral velocity (0) → packed 0.5. Signed range [-1,1] → packed [0,1].

export const ADVECT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 FragColor;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDissipation;
uniform float uDt;

void main() {
    // Decode signed velocity from packed [0,1] to signed [-1,1]
    vec2 vel = texture(uVelocity, vUv).xy * 2.0 - 1.0;

    // Backward trace in UV space directly (no texelSize factor)
    // With vel in [-1,1] and dt~0.016, max trace distance is ~0.016 UV units
    vec2 coord = vUv - vel * uDt;

    // Read source (also packed), decode to signed
    vec2 srcPacked = texture(uSource, coord).xy;
    vec2 srcSigned = srcPacked * 2.0 - 1.0;

    // Apply dissipation: shrink velocity toward 0
    vec2 dissipated = srcSigned * uDissipation;

    // Repack signed back to [0,1] for output
    FragColor = vec4(dissipated * 0.5 + 0.5, 0.0, 1.0);
}`;

// ── Force combine pass ──────────────────────────────────────────────────────
// Combines advected velocity + curl force + mouse splat into final velocity.
// All velocity stored PACKED: signed * 0.5 + 0.5 → [0,1].

export const COMBINE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 FragColor;

uniform sampler2D uAdvected;
uniform sampler2D uCurl;
uniform sampler2D uSplat;
uniform float uCurlStrength;
uniform float uMouseStrength;
uniform float uDt;

void main() {
    // Decode advected velocity from packed [0,1] to signed [-1,1]
    vec2 velocity = texture(uAdvected, vUv).xy * 2.0 - 1.0;

    // Decode curl force from [0,1] to [-1,1]
    vec2 curl = texture(uCurl, vUv).xy * 2.0 - 1.0;

    // Splat is positive magnitude in [0,1] — add to velocity.x
    float splat = texture(uSplat, vUv).x;

    velocity += curl * uCurlStrength * uDt;
    velocity.x += splat * uMouseStrength * uDt;

    // Pack signed velocity back to [0,1] for RGBA8 texture storage
    // Clamp to prevent overflow
    vec2 packed = clamp(velocity * 0.5 + 0.5, 0.0, 1.0);
    FragColor = vec4(packed, 0.0, 1.0);
}`;

// ── Render pass ─────────────────────────────────────────────────────────────
// Samples velocity field, colorizes by magnitude, outputs alpha for screen/multiply blend.

export const RENDER_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 FragColor;

uniform sampler2D uVelocity;
uniform vec3 uAccent;
uniform vec3 uGlow;
uniform float uTime;

void main() {
    vec2 vel = texture(uVelocity, vUv).xy;
    // Decode from [0,1] to [-1,1]
    vel = vel * 2.0 - 1.0;
    float mag = length(vel);

    // Smooth curve: very low magnitudes are invisible
    float alpha = smoothstep(0.02, 0.15, mag);
    alpha = pow(alpha, 1.8);

    // Color ramp: accent → glow as velocity increases
    vec3 color = mix(uAccent, uGlow, smoothstep(0.05, 0.25, mag));

    // Subtle hash-based dither to break up grid artifacts
    float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    alpha *= 0.85 + dither * 0.15;

    FragColor = vec4(color, alpha * 0.65);
}`;
