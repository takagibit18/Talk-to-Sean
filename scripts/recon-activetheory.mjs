#!/usr/bin/env node
/**
 * Recon probe for activetheory.net/work cursor-following WebGL effect.
 * Injects WebGL preload hooks (SOURCE evidence) BEFORE page scripts run,
 * inventories canvases, sweeps the pointer, and records uniforms that change
 * with pointer movement (cursor coupling).
 *
 * Outputs under .web-shader-extractor/evidence/
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const URL = process.argv[2] || 'https://activetheory.net/work?utm_source=chatgpt.com';
const OUT = resolve('.web-shader-extractor/evidence');
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'scout'), { recursive: true });
mkdirSync(join(OUT, 'gpu'), { recursive: true });
mkdirSync(join(OUT, 'screenshots'), { recursive: true });
mkdirSync(join(OUT, 'source'), { recursive: true });
mkdirSync(join(OUT, 'runtime'), { recursive: true });

const consoleLogs = [];
const networkReqs = [];

const USE_HEADED = process.env.HEADED === '1';
const browser = await chromium.launch({ headless: !USE_HEADED, args: [
  '--ignore-gpu-blocklist', '--enable-webgl',
  '--enable-unsafe-swiftshader', '--disable-blink-features=AutomationControlled',
]});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
});
const page = await context.newPage();

page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => consoleLogs.push(`[pageerror] ${err.message}`));
page.on('response', async response => {
  const u = response.url();
  const type = response.headers()['content-type'] || '';
  networkReqs.push({ url: u, status: response.status(), type: type.split(';')[0], size: parseInt(response.headers()['content-length']||'0') });
});

// ---- Preload hook: capture WebGL facts before page scripts run ----
await page.addInitScript(() => {
  const __capture = window.__glCapture = {
    contexts: [],          // {idx, canvasSelector, contextType, attrs}
    shaders: [],           // {program, type, source}
    programs: [],          // {program, shaders}
    uniformUpdates: [],    // {program, location, name, value, t}
    uniformNames: new Map(),
    draws: [],
    state: {},
    canvasByCtx: new Map(),
  };

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const ctx = origGetContext.call(this, type, attrs);
    if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')) {
      const idx = __capture.contexts.length;
      const sel = this.id ? `#${this.id}` : (this.className ? `canvas.${String(this.className).split(' ')[0]}` : `canvas:nth(${idx})`);
      __capture.contexts.push({ idx, selector: sel, contextType: type, attrs, cssW: this.clientWidth, cssH: this.clientHeight, backingW: this.width, backingH: this.height, owner: 'main-thread' });
      __capture.canvasByCtx.set(ctx, idx);
      hookGL(ctx, idx);
    }
    return ctx;
  };

  // OffscreenCanvas (worker-owned) hooks
  if (typeof OffscreenCanvas !== 'undefined') {
    const origOSGet = OffscreenCanvas.prototype.getContext;
    OffscreenCanvas.prototype.getContext = function (type, attrs) {
      const ctx = origOSGet.call(this, type, attrs);
      if (ctx && (type === 'webgl' || type === 'webgl2')) {
        const idx = __capture.contexts.length;
        __capture.contexts.push({ idx, selector: 'offscreen', contextType: type, attrs, backingW: this.width, backingH: this.height, owner: 'worker' });
        __capture.canvasByCtx.set(ctx, idx);
        hookGL(ctx, idx);
      }
      return ctx;
    };
  }
  const origTransfer = HTMLCanvasElement.prototype.transferControlToOffscreen;
  if (origTransfer) {
    HTMLCanvasElement.prototype.transferControlToOffscreen = function () {
      const oc = origTransfer.call(this);
      __capture.transferControl = ( __capture.transferControl || 0 ) + 1;
      const sel = this.id ? `#${this.id}` : (this.className ? `canvas.${String(this.className).split(' ')[0]}` : 'canvas');
      __capture.transferSelector = sel;
      __capture.transferCss = { w: this.clientWidth, h: this.clientHeight };
      return oc;
    };
  }

  function hookGL(gl, ctxIdx) {
    const origCreateShader = gl.createShader.bind(gl);
    const origShaderSource = gl.shaderSource.bind(gl);
    const origCompile = gl.compileShader.bind(gl);
    const origCreateProgram = gl.createProgram.bind(gl);
    const origAttach = gl.attachShader.bind(gl);
    const origLink = gl.linkProgram.bind(gl);
    const origUseProgram = gl.useProgram.bind(gl);
    const origGetUniformLocation = gl.getUniformLocation.bind(gl);
    const origGetActiveUniform = gl.getActiveUniform.bind(gl);
    const programs = new Map();

    gl.createShader = (type) => {
      const s = origCreateShader(type);
      s.__type = type;
      return s;
    };
    gl.shaderSource = (shader, src) => {
      __capture.shaders.push({ ctxIdx, shader: String(shader?.__id ?? ''), type: shader?.__type, source: src });
      shader.__src = src;
      return origShaderSource(shader, src);
    };
    gl.createProgram = () => {
      const p = origCreateProgram();
      p.__attached = [];
      programs.set(p, []);
      return p;
    };
    gl.attachShader = (p, s) => {
      programs.get(p)?.push(s);
      return origAttach(p, s);
    };
    gl.linkProgram = (p) => {
      const attached = programs.get(p) || [];
      __capture.programs.push({ ctxIdx, program: p.__id ?? '', vertexSrc: attached[0]?.__src, fragmentSrc: attached[1]?.__src, bothShaders: attached.map(s=>s.__src) });
      return origLink(p);
    };
    gl.getUniformLocation = (prog, name) => {
      const loc = origGetUniformLocation(prog, name);
      __capture.uniformNames.set(loc, { name, program: prog.__id });
      return loc;
    };

    // Wrap uniform setters to capture values + timing
    const wrap = (fnName) => {
      const orig = gl[fnName].bind(gl);
      gl[fnName] = function (loc, ...args) {
        const meta = __capture.uniformNames.get(loc);
        if (meta) {
          __capture.uniformUpdates.push({ ctxIdx, t: performance.now(), name: meta.name, fn: fnName, args: JSON.parse(JSON.stringify(args.map(a => typeof a === 'number' ? a : Array.from(a)))) });
          if (__capture.uniformUpdates.length > 4000) __capture.uniformUpdates.length = 4000;
        }
        return orig(loc, ...args);
      };
    };
    ['uniform1f','uniform2f','uniform3f','uniform4f','uniform1i','uniform2i','uniform3i','uniform4i','uniform1fv','uniform2fv','uniform3fv','uniform4fv','uniformMatrix2fv','uniformMatrix3fv','uniformMatrix4fv'].forEach(wrap);

    const origDrawArrays = gl.drawArrays.bind(gl);
    const origDrawElements = gl.drawElements.bind(gl);
    gl.drawArrays = (mode, first, count) => { __capture.draws.push({ ctxIdx, t: performance.now(), fn:'drawArrays', mode, first, count }); if(__capture.draws.length>2000) __capture.draws.length=2000; return origDrawArrays(mode, first, count); };
    gl.drawElements = (mode, count, type, offset) => { __capture.draws.push({ ctxIdx, t: performance.now(), fn:'drawElements', mode, count, type, offset }); if(__capture.draws.length>2000) __capture.draws.length=2000; return origDrawElements(mode, count, type, offset); };

    // State snapshots
    const origViewport = gl.viewport.bind(gl);
    gl.viewport = (x,y,w,h) => { __capture.state[`ctx${ctxIdx}.viewport`] = [x,y,w,h]; return origViewport(x,y,w,h); };
    const origBlendFunc = gl.blendFunc.bind(gl);
    gl.blendFunc = (s,d) => { __capture.state[`ctx${ctxIdx}.blendFunc`] = [s,d]; return origBlendFunc(s,d); };
    const origEnable = gl.enable.bind(gl);
    gl.enable = (cap) => { __capture.state[`ctx${ctxIdx}.enable:${cap}`] = true; return origEnable(cap); };
  }
});

try {
  console.log(`Navigating to ${URL} ...`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // 1. Canvas inventory (DOM-side)
  const canvasInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('canvas')).map((c, i) => {
      const st = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      return {
        index: i, id: c.id||null, className: c.className||null,
        css: { w: c.clientWidth, h: c.clientHeight },
        backing: { w: c.width, h: c.height },
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        dataEngine: c.dataset.engine||null, dataRenderer: c.dataset.renderer||null,
        style: { position: st.position, zIndex: st.zIndex, opacity: st.opacity, pointerEvents: st.pointerEvents, mixBlendMode: st.mixBlendMode, clipPath: st.clipPath },
        parent: c.parentElement ? { tag: c.parentElement.tagName, className: (c.parentElement.className||'').slice(0,120), position: getComputedStyle(c.parentElement).position } : null,
      };
    });
  });
  writeFileSync(join(OUT, 'scout', 'canvas-info.json'), JSON.stringify(canvasInfo, null, 2));
  console.log(`canvas count: ${canvasInfo.length}`);

  // 2. Screenshot baseline
  await page.screenshot({ path: join(OUT, 'screenshots', 'baseline.png') });

  // 3. Pointer sweep: move mouse in an L pattern and record which uniforms change
  const before = await page.evaluate(() => window.__glCapture?.uniformUpdates.length || 0);
  await page.mouse.move(200, 200, { steps: 8 });
  await page.waitForTimeout(400);
  await page.mouse.move(1200, 200, { steps: 12 });
  await page.waitForTimeout(400);
  await page.mouse.move(1200, 700, { steps: 12 });
  await page.waitForTimeout(400);
  await page.mouse.move(720, 450, { steps: 12 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, 'screenshots', 'after-pointer.png') });

  // 4. Dump capture
  const capture = await page.evaluate(() => {
    const c = window.__glCapture;
    if (!c) return { error: 'no capture' };
    // group uniform names by frequency and by whether they changed during pointer sweep
    const names = {};
    for (const u of c.uniformUpdates) {
      names[u.name] = (names[u.name]||0)+1;
    }
    return {
      contexts: c.contexts,
      programs: c.programs.map((p,i)=>({ ...p, idIdx:i, hasVert: !!p.vertexSrc, hasFrag: !!p.fragmentSrc })),
      shaders: c.shaders,
      uniformNameCounts: names,
      uniformUpdateCount: c.uniformUpdates.length,
      drawCount: c.draws.length,
      state: c.state,
      // first 60 uniform updates for inspection
      uniformSample: c.uniformUpdates.slice(0, 60),
      drawSample: c.draws.slice(0, 40),
    };
  });
  writeFileSync(join(OUT, 'gpu', 'gl-capture.json'), JSON.stringify(capture, null, 2));
  // Shader source files
  if (capture.programs?.length) {
    capture.programs.forEach((p, i) => {
      if (p.fragmentSrc) writeFileSync(join(OUT, 'source', `ctx${p.ctxIdx}-prog${i}-frag.glsl`), p.fragmentSrc);
      if (p.vertexSrc) writeFileSync(join(OUT, 'source', `ctx${p.ctxIdx}-prog${i}-vert.glsl`), p.vertexSrc);
    });
  }
  console.log(`contexts: ${capture.contexts?.length}, programs: ${capture.programs?.length}, uniformUpdates: ${capture.uniformUpdateCount}, draws: ${capture.drawCount}`);

  // 5. DOM + network
  const html = await page.content();
  writeFileSync(join(OUT, 'scout', 'dom.html'), html);
  writeFileSync(join(OUT, 'scout', 'network.json'), JSON.stringify(networkReqs, null, 2));
  writeFileSync(join(OUT, 'scout', 'console.log'), consoleLogs.join('\n'));

  console.log(`Done. Evidence in ${OUT}`);
} catch (e) {
  console.error('ERROR:', e.message);
  writeFileSync(join(OUT, 'scout', 'error.log'), String(e?.stack || e));
} finally {
  await browser.close();
}
