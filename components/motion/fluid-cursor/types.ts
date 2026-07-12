export interface FluidCursorConfig {
  /** Internal fluid sim resolution (default 512) */
  simResolution: number;
  /** Display DPR clamp (default 2) */
  maxDpr: number;
  /** Curl noise spatial scale factor */
  curlScale: number;
  /** Curl noise temporal speed factor */
  curlSpeed: number;
  /** Velocity dissipation per frame (0-1, higher = less dissipation) */
  dissipation: number;
  /** Mouse strength multiplier for splat injection */
  mouseStrength: number;
  /** Mouse splat radius in normalized coords (0-1) */
  mouseRadius: number;
  /** Minimum viewport pixel width for activation */
  minWidth: number;
  /** Dark theme accent colors (RGB, 0-1) */
  accentDark: [number, number, number];
  accentDarkGlow: [number, number, number];
  /** Light theme accent colors (RGB, 0-1) */
  accentLight: [number, number, number];
  accentLightGlow: [number, number, number];
}

export const DEFAULT_FLUID_CONFIG: FluidCursorConfig = {
  simResolution: 512,
  maxDpr: 2,
  curlScale: 1.0,
  curlSpeed: 0.5,
  dissipation: 0.98,
  mouseStrength: 1.5,
  mouseRadius: 0.08,
  minWidth: 768,
  accentDark: [0.882, 0.741, 0.408],
  accentDarkGlow: [0.788, 0.604, 0.243],
  accentLight: [0.714, 0.435, 0.114],
  accentLightGlow: [0.529, 0.318, 0.082],
};

export interface MouseState {
  uv: [number, number];
  prevUV: [number, number];
  velocity: number;
  active: boolean;
}

export interface ThemeState {
  isLight: boolean;
  blendMode: number; // 0 = screen, 1 = multiply
  accent: [number, number, number];
  glow: [number, number, number];
}
