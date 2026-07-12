// Fluid simulation orchestrator.
// Manages WebGL2 programs, textures, FBOs, and the multi-pass simulation pipeline.
// Pure TypeScript — no React dependencies.

import {
  FULLSCREEN_VERT,
  CURL_FRAG,
  SPLAT_FRAG,
  ADVECT_FRAG,
  COMBINE_FRAG,
  RENDER_FRAG,
} from "./shaders";
import {
  createFloatTexture,
  createFramebuffer,
  createProgram,
  createQuadVAO,
} from "./webgl-context";
import type { FluidCursorConfig, MouseState, ThemeState } from "./types";
import { DEFAULT_FLUID_CONFIG } from "./types";

interface ProgramSet {
  curl: WebGLProgram;
  splat: WebGLProgram;
  advect: WebGLProgram;
  combine: WebGLProgram;
  render: WebGLProgram;
}

interface TextureSet {
  velocityA: WebGLTexture;
  velocityB: WebGLTexture;
  curl: WebGLTexture;
  splat: WebGLTexture;
}

interface FBOSet {
  velocityA: WebGLFramebuffer;
  velocityB: WebGLFramebuffer;
  curl: WebGLFramebuffer;
  splat: WebGLFramebuffer;
}

export class FluidSim {
  private gl: WebGL2RenderingContext;
  private programs!: ProgramSet;
  private textures!: TextureSet;
  private fbos!: FBOSet;
  private quadVAO!: WebGLVertexArrayObject;
  private resolution: number;
  private config: FluidCursorConfig;
  private dpr: number;
  private usePingPong = true;
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor(
    gl: WebGL2RenderingContext,
    config: Partial<FluidCursorConfig> = {},
  ) {
    this.gl = gl;
    this.config = { ...DEFAULT_FLUID_CONFIG, ...config };
    this.resolution = this.config.simResolution;
    this.dpr = 1;
    this.init();
  }

  private init() {
    const { gl, resolution } = this;

    // Compile all programs
    this.programs = {
      curl: createProgram(gl, FULLSCREEN_VERT, CURL_FRAG, "curl"),
      splat: createProgram(gl, FULLSCREEN_VERT, SPLAT_FRAG, "splat"),
      advect: createProgram(gl, FULLSCREEN_VERT, ADVECT_FRAG, "advect"),
      combine: createProgram(gl, FULLSCREEN_VERT, COMBINE_FRAG, "combine"),
      render: createProgram(gl, FULLSCREEN_VERT, RENDER_FRAG, "render"),
    };

    // Create shared quad VAO using the first program
    this.quadVAO = createQuadVAO(gl, this.programs.curl);

    // Create textures
    this.textures = {
      velocityA: createFloatTexture(gl, resolution, resolution),
      velocityB: createFloatTexture(gl, resolution, resolution),
      curl: createFloatTexture(gl, resolution, resolution),
      splat: createFloatTexture(gl, resolution, resolution),
    };

    // Create FBOs
    this.fbos = {
      velocityA: createFramebuffer(gl, this.textures.velocityA),
      velocityB: createFramebuffer(gl, this.textures.velocityB),
      curl: createFramebuffer(gl, this.textures.curl),
      splat: createFramebuffer(gl, this.textures.splat),
    };
  }

  step(dt: number, time: number, mouse: MouseState) {
    const { gl, resolution, programs, textures, fbos } = this;
    const clampedDt = Math.min(dt, 0.05); // prevent sim explosion

    // 1. Curl noise pass → textures.curl
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.curl);
    gl.viewport(0, 0, resolution, resolution);
    gl.useProgram(programs.curl);
    gl.uniform1f(
      gl.getUniformLocation(programs.curl, "uTime"),
      time,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.curl, "uCurlScale"),
      this.config.curlScale,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.curl, "uCurlSpeed"),
      this.config.curlSpeed,
    );
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 2. Mouse splat pass → textures.splat (with screen blend via framebuffer)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.splat);
    gl.viewport(0, 0, resolution, resolution);
    // Clear splat each frame
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Enable additive blending for splat accumulation
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(programs.splat);
    const aspectRatio = this.canvasWidth / Math.max(this.canvasHeight, 1);
    gl.uniform2f(
      gl.getUniformLocation(programs.splat, "uMouseUV"),
      mouse.uv[0],
      mouse.uv[1],
    );
    gl.uniform2f(
      gl.getUniformLocation(programs.splat, "uPrevMouseUV"),
      mouse.prevUV[0],
      mouse.prevUV[1],
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.splat, "uMouseVelocity"),
      mouse.velocity,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.splat, "uRadius"),
      this.config.mouseRadius,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.splat, "uAspectRatio"),
      aspectRatio,
    );
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);

    // 3. Advection pass: read velocityA, write velocityB
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.velocityB);
    gl.viewport(0, 0, resolution, resolution);
    gl.useProgram(programs.advect);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.velocityA);
    gl.uniform1i(gl.getUniformLocation(programs.advect, "uVelocity"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.velocityA);
    gl.uniform1i(gl.getUniformLocation(programs.advect, "uSource"), 1);
    gl.uniform1f(
      gl.getUniformLocation(programs.advect, "uDissipation"),
      this.config.dissipation,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.advect, "uDt"),
      clampedDt,
    );
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 4. Force combine: read advected(B) + curl + splat → write velocityA
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.velocityA);
    gl.viewport(0, 0, resolution, resolution);
    gl.useProgram(programs.combine);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.velocityB); // advected result
    gl.uniform1i(gl.getUniformLocation(programs.combine, "uAdvected"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.curl);
    gl.uniform1i(gl.getUniformLocation(programs.combine, "uCurl"), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textures.splat);
    gl.uniform1i(gl.getUniformLocation(programs.combine, "uSplat"), 2);
    gl.uniform1f(
      gl.getUniformLocation(programs.combine, "uCurlStrength"),
      0.5,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.combine, "uMouseStrength"),
      this.config.mouseStrength,
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.combine, "uDt"),
      clampedDt,
    );
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  render(theme: ThemeState) {
    const { gl, resolution, programs, textures } = this;

    // Render to default framebuffer (screen)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    gl.useProgram(programs.render);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.velocityA);
    gl.uniform1i(gl.getUniformLocation(programs.render, "uVelocity"), 0);
    gl.uniform3f(
      gl.getUniformLocation(programs.render, "uAccent"),
      theme.accent[0],
      theme.accent[1],
      theme.accent[2],
    );
    gl.uniform3f(
      gl.getUniformLocation(programs.render, "uGlow"),
      theme.glow[0],
      theme.glow[1],
      theme.glow[2],
    );
    gl.uniform1f(
      gl.getUniformLocation(programs.render, "uTime"),
      performance.now() * 0.001,
    );
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  destroy() {
    const { gl, programs, textures, fbos } = this;
    // Delete programs
    Object.values(programs).forEach((p) => gl.deleteProgram(p));
    // Delete textures
    Object.values(textures).forEach((t) => gl.deleteTexture(t));
    // Delete FBOs
    Object.values(fbos).forEach((f) => gl.deleteFramebuffer(f));
    // Delete VAO
    if (this.quadVAO) gl.deleteVertexArray(this.quadVAO);
  }
}
