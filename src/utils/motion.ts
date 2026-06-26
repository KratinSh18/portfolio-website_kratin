// Shared motion helpers used by the 3D / horizontal-scroll layer.

// Matches the `NavbarHeight` token in theme/index.ts ("144px").
export const NAVBAR_PX = 144;

export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
