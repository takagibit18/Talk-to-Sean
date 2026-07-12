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
uniform float uCurlNoiseScale;
uniform float uCurlTimeScale;
uniform float uCurlNoiseSpeed;
uniform float uMouseStrength;
uniform float HZ;
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

vec3 snoiseVec3( vec3 x ) {
    float s  = potential1(x);
    float s1 = potential2(x);
    float s2 = potential3(x);
    return vec3( s , s1 , s2 );
}

//Analitic derivatives of the potentials for the curl noise, based on: http://weber.itn.liu.se/~stegu/TNM084-2019/bridson-siggraph2007-curlnoise.pdf

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
    return -0.48 * cosf2(v.y * -0.48 + v.z * 5.4) + 2.56 * cosf2(v.y * 2.56 + v.z * 5.4) +  4.16 * cosf2(v.y * 4.16 + v.z * 2.4) -4.16 * cosf2(v.y * -4.16 + v.z * 1.35);
}


vec3 curlNoise( vec3 p ) {

    //A sinf2 or cosf2 call is a trigonometric function, these functions are expensive in the GPU
    //the partial derivatives with approximations require to calculate the snoiseVec3 function 4 times.
    //The previous function evaluate the potentials that include 8 trigonometric functions each.
    //
    //This means that the potentials are evaluated 12 times (4 calls to snoiseVec3 that make 3 potential calls).
    //The whole process call 12 * 8 trigonometric functions, a total of 96 times.


    /*
    const float e = 1e-1;
    vec3 dx = vec3( e   , 0.0 , 0.0 );
    vec3 dy = vec3( 0.0 , e   , 0.0 );
    vec3 dz = vec3( 0.0 , 0.0 , e   );
    vec3 p0 = snoiseVec3(p);
    vec3 p_x1 = snoiseVec3( p + dx );
    vec3 p_y1 = snoiseVec3( p + dy );
    vec3 p_z1 = snoiseVec3( p + dz );
    float x = p_y1.z - p0.z - p_z1.y + p0.y;
    float y = p_z1.x - p0.x - p_x1.z + p0.z;
    float z = p_x1.y - p0.y - p_y1.x + p0.x;
    return normalize( vec3( x , y , z ));
    */


    //The noise that is used to define the potentials is based on analitic functions that are easy to derivate,
    //meaning that the analitic solution would provide a much faster approach with the same visual results.
    //
    //Usinf2g the analitic derivatives the algorithm does not require to evaluate snoiseVec3, instead it uses the
    //analitic partial derivatives from each potential on the corresponding axis, providing a total of
    //36 calls to trigonometric functions, making the analytic evaluation almost 3 times faster than the aproximation method.


    float x = dP3dY(p) - dP2dZ(p);
    float y = dP1dZ(p) - dP3dX(p);
    float z = dP2dX(p) - dP1dY(p);


    return normalize( vec3( x , y , z ));



}
vec3 applyQuaternion(vec3 vec, vec4 quat) {
    return vec + 2.0 * cross(quat.xyz, cross(quat.xyz, vec) + quat.w * vec);
}

// Total training time taken: 55.728095 seconds
// Total Loss:  6.774403300369158e-05
float logo_sdf(vec3 p) {
    // Mirror and flip
    p.z = sqrt(p.z * p.z + 0.0215) - sqrt(0.012); // first number is "clip width", second is "seam width"
    p = applyQuaternion(p, vec4(0.5));
  if (length(p) > .8) return length(p)-.7;
  vec4 x=vec4(p,1),
    f00=sin(x*mat4(-.91,-4.0,-.9,-1.09,.49,4.33,-2.8,-.61,-3.86,-1.09,-1.97,.33,-3.62,2.82,-3.46,1.44)),
    f01=sin(x*mat4(1.44,1.65,-5.59,.06,-.49,-5.06,-.79,.42,2.16,.94,8.4,1.65,.88,-6.19,5.45,.51)),
    f02=sin(x*mat4(3.74,1.67,-2.29,-.34,3.25,-2.21,-.4,-.2,-1.51,7.37,-5.42,.19,.34,-1.96,3.46,.5)),
    f10=sin(mat4(.57,-1.33,-.77,-.16,.77,-.88,-.08,.72,.19,-.25,.87,-.38,-.33,.9,.35,.19)*f00+mat4(-.45,-.8,.4,.4,.24,-.58,.17,-.6,-.49,-.03,-.14,.29,.34,.19,.49,.4)*f01+mat4(.72,-.24,.85,.75,.75,1.01,.59,-.53,.09,.09,.49,.69,-.77,.64,.48,-.24)*f02+vec4(1.16,.88,1.41,1.26)),
    f11=sin(mat4(.09,.83,.54,.11,-1.23,-.25,-.52,.63,-.23,-.1,.34,-1.04,-.42,-.4,-.14,.21)*f00+mat4(-.05,.04,.6,-.69,1.06,.4,.68,.01,.25,.28,.04,.06,-.18,-1.16,-.6,.08)*f01+mat4(.02,-.7,.04,.93,.68,.98,.58,-.44,-.44,-1.15,.0,-.68,.87,.95,-.33,.51)*f02+vec4(2.05,.9,-.97,1.33)),
    f12=sin(mat4(-.55,-1.13,.68,.38,.85,.51,-.67,-.45,.06,.29,-1.2,-.21,-.61,.3,.08,-.1)*f00+mat4(-1.13,.32,.06,.15,-.82,.31,-.65,1.67,-.34,-.1,-.12,.37,-.67,-.52,-.67,-.73)*f01+mat4(-.16,-.3,.36,-.54,-.3,-.51,1.23,.45,-1.53,-.52,-.47,-1.08,-.19,.43,-.87,-.55)*f02+vec4(-.04,-.88,-.67,1.62));
  return dot(vec4(.05,.04,.09,.07),f10)+dot(vec4(.07,.08,-.08,.07),f11)+dot(vec4(-.03,-.08,.07,.04),f12)+.01;
}

vec3 logo_norm(vec3 p) {
    mat3 k = mat3(p,p,p)-mat3(0.001);
    return normalize(logo_sdf(p) - vec3(logo_sdf(k[0]),logo_sdf(k[1]),logo_sdf(k[2])));
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

    
// vec3 curl = curlNoise(pos * uCurlNoiseScale*0.1 + (time * uCurlTimeScale * 0.1));
// pos += curl * uCurlNoiseSpeed * 0.01 * HZ;

// // add force to flip flow force along y-axis
// float flip = mod(time, 4.);
// pos.y += 0.01 * (flip > 2. ? -1. : 1.);
// pos.y += 0.01;


vec3 curl = curlNoise(pos * uCurlNoiseScale*0.1 + (time * uCurlTimeScale * 0.1));
pos += curl * uCurlNoiseSpeed * 0.0002 * HZ;

vec3 gradient = logo_norm(pos.xyz);
float sdf = logo_sdf(pos.xyz);

vec3 dir = cross(normalize(pos), normalize(gradient));
pos += dir * 0.001;

// volume gradient is direction towards surface
// sdf is distance
// gradient * distance gets us to the surface
pos += -gradient * sdf;

// prevent particles converging by lerping back to origin
pos += (origin - pos) * 0.0002 * HZ;


vec3 mpos = vec3(uModelMatrix * vec4(pos, 1.0));
vec2 screenUV = getProjection(mpos, uProjMatrix);
vec3 flow = vec3(texture(tFluid, screenUV).xy, 0.0);
applyNormal(flow, uProjNormalMatrix);
pos += flow * 0.0001 * HZ * uMouseStrength * texture(tFluidMask, screenUV).r;
//code

    FragColor = vec4(pos, data);
}