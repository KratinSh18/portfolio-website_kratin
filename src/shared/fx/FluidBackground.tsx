import { FC, useEffect, useRef, useState } from "react";

import { useColorMode } from "@chakra-ui/react";

import { AuroraBackground } from "shared/fx/AuroraBackground";
import { useReducedMotion } from "shared/motion/useReducedMotion";

import "shared/fx/FluidBackground.scss";

// The toned sections, top to bottom (App.tsx [data-tone]); the liquid takes each
// one's colour behind it. The order is u_band's (FRAG).
const TONES = ["hero", "playoshi", "work", "about"];

// Internal resolution in CSS px, independent of devicePixelRatio. The flow is
// soft by nature, so CSS stretching it ~3x is invisible; on a 2x screen this is
// ~1/5 of the old DPR-scaled buffer. Touch screens are smaller and weaker.
const RENDER_SCALE = 0.35;
const RENDER_SCALE_TOUCH = 0.3;
const MAX_SIDE = 720;
// rAF runs at 120Hz on ProMotion screens; the flow is slow enough that 60fps
// is indistinguishable and halves the GPU bill.
const MIN_FRAME_MS = 1000 / 60 - 2;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Domain-warped fbm (IQ's "warp of a warp"): q warps p, r warps p by q, the
// final field f is sampled through r. The last fbm also returns its analytic
// gradient (value-noise derivatives, nearly free) for the soft specular sheen,
// so it's 5 fbm calls per pixel instead of 7 (two finite-difference taps).
// Dark mode is kept deliberately low in luminance so body text stays readable
// with no extra backdrop.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_scroll;
// Each toned section's top and bottom edges on screen, as fractions of the
// height from the top: hero, PlayOshi, work, about (TONES).
uniform vec2 u_band[4];
uniform float u_light;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = M * p;
        a *= 0.5;
    }
    return v;
}

// fbm plus its gradient: .x value, .yz d/dp. Octave k samples M^k p, so its
// gradient is (M^k)^T times the noise's; GLSL's v * m is m^T v.
vec3 fbmd(vec2 p) {
    float v = 0.0;
    vec2 g = vec2(0.0);
    float a = 0.5;
    mat2 J = mat2(1.0);
    for (int i = 0; i < 4; i++) {
        vec2 i0 = floor(p);
        vec2 fr = fract(p);
        vec2 u = fr * fr * (3.0 - 2.0 * fr);
        vec2 du = 6.0 * fr * (1.0 - fr);
        float h00 = hash(i0);
        float h10 = hash(i0 + vec2(1.0, 0.0));
        float h01 = hash(i0 + vec2(0.0, 1.0));
        float h11 = hash(i0 + vec2(1.0, 1.0));
        float k = h00 - h10 - h01 + h11;
        v += a * (h00 + (h10 - h00) * u.x + (h01 - h00) * u.y + k * u.x * u.y);
        g += a * ((du * (vec2(h10 - h00, h01 - h00) + k * u.yx)) * J);
        p = M * p;
        J = M * J;
        a *= 0.5;
    }
    return vec3(v, g);
}

// 1 inside a section's edges, 0 outside. Each edge fades in just inside the
// section and is pushed further in by the flow itself (f >= 0), so it reads as
// ink bleeding in, never a straight seam, and never reaches outside it.
// Neighbouring sections' bands therefore never overlap.
float band(vec2 b, float yd, float f) {
    return smoothstep(b.x, b.x + 0.2, yd - f * 0.14) * (1.0 - smoothstep(b.y - 0.2, b.y, yd + f * 0.14));
}

// A section's dark palette over the base: its main current, a related
// counter-current and a hotter core. The colours come pre-scaled per hue, so
// every section burns about as bright as PlayOshi's lime.
vec3 tone(vec3 base, vec3 cMain, vec3 cCounter, vec3 cHot, float cur, float cnt, float core, float infl) {
    vec3 col = mix(base, cMain, cur * 0.9);
    col = mix(col, cCounter, cnt * 0.6);
    return col + cHot * core + cMain * infl * 0.0889;
}

// The light twin: pale ink of the hue on paper, never dark.
vec3 ink(vec3 paper, vec3 cMain, vec3 cCounter, float cur, float cnt, float core) {
    vec3 col = mix(paper, cMain, cur * 0.75);
    col = mix(col, cCounter, cnt * 0.55);
    return mix(col, cMain * 0.94, core * 0.35);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * aspect, uv.y) * 1.6;

    // The flow swirls around the cursor: rotate the domain by an angle that
    // falls off with distance, so the liquid bends instead of being pushed.
    vec2 m = vec2(u_mouse.x * aspect, u_mouse.y) * 1.6;
    vec2 d = p - m;
    float infl = exp(-dot(d, d) * 2.4);
    float ang = infl * 1.5;
    float s = sin(ang);
    float c = cos(ang);
    p = m + mat2(c, s, -s, c) * d;

    // Drift with scroll (slower than the content, so it reads as depth).
    p.y -= u_scroll * 0.45;

    float t = u_time * 0.045;
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + vec2(t, -t * 0.6)),
                  fbm(p + vec2(5.2, 1.3) - vec2(t * 0.7, t * 0.4)));
    vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + vec2(t * 1.2, 0.0)),
                  fbm(p + 3.5 * q + vec2(8.3, 2.8) - vec2(0.0, t * 0.9)));
    vec3 fd = fbmd(p + 3.5 * r);
    float f = fd.x;

    vec3 n = normalize(vec3(-fd.yz, 2.2));
    vec3 lightDir = normalize(vec3(-0.45, 0.6, 0.65));
    float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 22.0);

    float cur = smoothstep(0.38, 0.9, f);                       // main current
    float counter = smoothstep(0.45, 0.95, length(q)) * (1.0 - cur); // counter-current
    float hot = smoothstep(0.55, 0.85, r.y) * cur;               // bright core

    // One palette per toned section over one field. Everywhere: warm smoke,
    // cream and warm grey at low luminance (ink in oil). Behind each section
    // (the band it covers on screen): its own colour. The palettes cross-fade
    // through the bare base, one fading down before the next comes up, and
    // the bands never overlap, so the hues never mix to mud; the seams
    // between sections stay smoke.
    float yd = 1.0 - uv.y;
    float bHero = band(u_band[0], yd, f);
    float bKp = band(u_band[1], yd, f);
    float bWork = band(u_band[2], yd, f);
    float bAbout = band(u_band[3], yd, f);
    float wMono = 1.0 - smoothstep(0.0, 0.6, bHero + bKp + bWork + bAbout);
    float wHero = smoothstep(0.4, 1.0, bHero);
    float wKp = smoothstep(0.4, 1.0, bKp);
    float wWork = smoothstep(0.4, 1.0, bWork);
    float wAbout = smoothstep(0.4, 1.0, bAbout);

    vec3 base = vec3(0.039, 0.043, 0.039);
    vec3 cream = vec3(0.949, 0.910, 0.835);
    vec3 stone = vec3(0.659, 0.639, 0.604);
    vec3 mono = base;
    mono = mix(mono, cream * 0.11, cur * 0.9);
    mono = mix(mono, stone * 0.1, counter * 0.6);
    mono += cream * hot * 0.045;
    mono += cream * infl * 0.015;

    // PlayOshi lime (#c5f41f) with a hotter lime core and a teal-green
    // counter-current. Lime is very luminous, so its weights are low; the
    // other hues are darker per unit and get higher weights to match it.
    vec3 lime = vec3(0.773, 0.957, 0.122);
    vec3 kp = tone(base, lime * 0.225, vec3(0.1, 0.62, 0.4) * 0.13, vec3(0.86, 1.0, 0.36) * 0.105, cur, counter, hot, infl);
    // terracotta (#e8775a), a rose-brick counter, a peach core
    vec3 hero = tone(base, vec3(0.91, 0.467, 0.353) * 0.32, vec3(0.7, 0.22, 0.2) * 0.18, vec3(1.0, 0.62, 0.45) * 0.14, cur, counter, hot, infl);
    // mustard (#f2c14e) pushed to a purer gold (a dim mustard reads as brown),
    // a burnt-amber counter, a butter core
    vec3 work = tone(base, vec3(1.0, 0.75, 0.18) * 0.27, vec3(0.9, 0.5, 0.08) * 0.15, vec3(1.0, 0.86, 0.4) * 0.115, cur, counter, hot, infl);
    // teal (#4fd1c5), a deep sea-blue counter, an aqua core
    vec3 about = tone(base, vec3(0.31, 0.82, 0.773) * 0.275, vec3(0.1, 0.42, 0.62) * 0.15, vec3(0.55, 0.96, 0.9) * 0.11, cur, counter, hot, infl);

    vec3 dark = base + (mono - base) * wMono + (kp - base) * wKp + (hero - base) * wHero
        + (work - base) * wWork + (about - base) * wAbout;
    vec3 sheen = vec3(1.0, 0.97, 0.92) * (1.0 - wKp - wHero - wWork - wAbout) + vec3(0.92, 1.0, 0.9) * wKp
        + vec3(1.0, 0.9, 0.85) * wHero + vec3(1.0, 0.95, 0.84) * wWork + vec3(0.88, 1.0, 0.98) * wAbout;
    dark += sheen * spec * (0.02 + 0.045 * cur);

    // Light: ink dropped in water on paper, tints only, never dark. Warm grey
    // ink everywhere, each section's own ink inside it.
    vec3 paper = vec3(0.968, 0.972, 0.962);
    vec3 monoInk = vec3(0.88, 0.86, 0.82);
    vec3 monoCounter = vec3(0.92, 0.905, 0.875);
    vec3 monoLight = paper;
    monoLight = mix(monoLight, monoInk, cur * 0.75);
    monoLight = mix(monoLight, monoCounter, counter * 0.55);
    monoLight = mix(monoLight, monoInk * 0.95, hot * 0.35);
    vec3 kpLight = ink(paper, vec3(0.86, 0.95, 0.6), vec3(0.82, 0.93, 0.87), cur, counter, hot);
    vec3 heroLight = ink(paper, vec3(0.98, 0.82, 0.74), vec3(0.95, 0.86, 0.84), cur, counter, hot);
    vec3 workLight = ink(paper, vec3(0.97, 0.89, 0.64), vec3(0.97, 0.87, 0.76), cur, counter, hot);
    vec3 aboutLight = ink(paper, vec3(0.73, 0.92, 0.9), vec3(0.8, 0.89, 0.94), cur, counter, hot);
    vec3 light = paper + (monoLight - paper) * wMono + (kpLight - paper) * wKp + (heroLight - paper) * wHero
        + (workLight - paper) * wWork + (aboutLight - paper) * wAbout;
    light += spec * 0.035;

    vec3 col = mix(dark, light, u_light);
    // 1/255 dither kills banding in the near-black gradients.
    col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};

interface Gl {
    program: WebGLProgram;
    buffer: WebGLBuffer;
    u: Record<"res" | "time" | "mouse" | "scroll" | "band" | "light", WebGLUniformLocation | null>;
}

const setup = (gl: WebGLRenderingContext): Gl | null => {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    if (!vs || !fs || !program || !buffer) return null;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    // One triangle that overshoots the viewport covers every pixel with no seam.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const at = (name: string) => gl.getUniformLocation(program, name);
    return {
        program,
        buffer,
        u: {
            res: at("u_res"),
            time: at("u_time"),
            mouse: at("u_mouse"),
            scroll: at("u_scroll"),
            band: at("u_band[0]"),
            light: at("u_light"),
        },
    };
};

// A band edge far off the canvas: both edges here = an empty band (section off
// screen); the hero's top and the last section's bottom sit here so their
// colour runs to the page's ends instead of fading out at them.
const NO_BAND = -10;
const FAR_BELOW = 10;

// IntersectionObserver steps for the toned sections: every 2% of a section's
// height re-reads its edges, so they never drift from a layout change for long.
const BAND_THRESHOLDS = Array.from({ length: 51 }, (_, i) => i / 50);

/** Frame-rate independent easing toward a target (k ≈ 1/time-constant in seconds). */
const approach = (from: number, to: number, k: number, dt: number) => from + (to - from) * (1 - Math.exp(-k * dt));

/**
 * The site's living backdrop: warm smoke on near-black (ink on paper in light
 * mode) that takes each section's tone behind it (terracotta, PlayOshi lime,
 * mustard, teal), rendered by one raw WebGL1 fragment shader. Every
 * input (time, pointer, scroll, section edges, colour mode) is a uniform fed
 * from a single rAF loop — no React state per frame. Falls back to the CSS
 * aurora without WebGL, and draws one still frame under reduced motion.
 */
export const FluidBackground: FC = () => {
    const reduced = useReducedMotion();
    const { colorMode } = useColorMode();
    const [fallback, setFallback] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lightRef = useRef(colorMode === "light" ? 1 : 0);
    // Runs when the colour mode flips: repaints the still frame (reduced
    // motion), or snaps the palette if the canvas hasn't been seen yet.
    const redrawRef = useRef<() => void>(() => undefined);

    useEffect(() => {
        lightRef.current = colorMode === "light" ? 1 : 0;
        redrawRef.current();
    }, [colorMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const attrs: WebGLContextAttributes = {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            // Stay on the integrated GPU: a background never justifies waking
            // the discrete one (and the switch itself can lose the context).
            powerPreference: "low-power",
        };
        const gl = (canvas.getContext("webgl", attrs) ||
            canvas.getContext("experimental-webgl", attrs)) as WebGLRenderingContext | null;
        if (!gl) {
            setFallback(true);
            return;
        }

        let res = setup(gl);
        if (!res) {
            setFallback(true);
            return;
        }

        let raf = 0;
        let last = 0;
        let lastDraw = 0;
        const touch = window.matchMedia("(pointer: coarse)").matches;

        // Each band follows its section's edges in page px, read from one
        // IntersectionObserver instead of a getBoundingClientRect per frame (which
        // forced a style/layout flush in the middle of every scroll frame); each
        // frame only subtracts scrollY. The sections are lazy, so the loop looks
        // them up until they exist, and again if one remounts. Reduced motion
        // keeps the still frame all smoke, as before.
        const els: (Element | null)[] = TONES.map(() => null);
        const bands = TONES.map(() => ({ on: false, top: 0, bottom: 0 }));
        const readBand = (i: number, r: DOMRectReadOnly) => {
            bands[i].top = r.top + window.scrollY;
            bands[i].bottom = r.bottom + window.scrollY;
        };
        const io =
            !reduced && typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      (entries) => {
                          entries.forEach((e) => {
                              const i = els.indexOf(e.target);
                              if (i < 0) return;
                              bands[i].on = e.isIntersecting;
                              readBand(i, e.boundingClientRect);
                          });
                      },
                      { threshold: BAND_THRESHOLDS }
                  )
                : null;
        // every frame: a plain loop, no closures, and a lookup only while one is missing
        const watchSections = () => {
            if (!io) return;
            for (let i = 0; i < TONES.length; i++) {
                const el = els[i];
                if (el && el.isConnected) continue;
                if (el) {
                    io.unobserve(el);
                    bands[i].on = false;
                }
                // the cursor root carries a data-tone too
                const found = document.querySelector(`[data-tone="${TONES[i]}"]:not(.fx-cursor)`);
                els[i] = found;
                if (found) io.observe(found);
            }
        };
        let viewH = Math.max(canvas.clientHeight, 1);

        const s = {
            time: 8 + Math.random() * 40, // start somewhere different each visit
            mx: 0.62,
            my: 0.58,
            tx: 0.62,
            ty: 0.58,
            // Seeded from the live page so a reload mid-page doesn't swoosh into place.
            scroll: reduced ? 0 : window.scrollY / Math.max(window.innerHeight, 1),
            // u_band: top, bottom per section (TONES order)
            bands: new Float32Array(TONES.length * 2).fill(NO_BAND),
            light: lightRef.current,
        };

        const resize = () => {
            const cw = canvas.clientWidth;
            const ch = canvas.clientHeight;
            viewH = Math.max(ch, 1);
            // a resize moves the sections without always crossing an IO step
            els.forEach((el, i) => {
                if (el && el.isConnected) readBand(i, el.getBoundingClientRect());
            });
            const scale = Math.min(touch ? RENDER_SCALE_TOUCH : RENDER_SCALE, MAX_SIDE / Math.max(cw, ch, 1));
            const w = Math.max(1, Math.round(cw * scale));
            const h = Math.max(1, Math.round(ch * scale));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        };

        const draw = () => {
            if (!res || gl.isContextLost()) return;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(res.u.res, canvas.width, canvas.height);
            gl.uniform1f(res.u.time, s.time);
            gl.uniform2f(res.u.mouse, s.mx, s.my);
            gl.uniform1f(res.u.scroll, s.scroll);
            gl.uniform2fv(res.u.band, s.bands);
            gl.uniform1f(res.u.light, s.light);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            // classList.add rewrites the attribute even when present; once is enough
            if (!canvas.classList.contains("is-ready")) canvas.classList.add("is-ready");
        };

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            if (now - lastDraw < MIN_FRAME_MS) return;
            lastDraw = now;
            // Clamp dt so a stalled frame (tab switch, GC) never makes the flow jump.
            const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
            last = now;

            s.time += dt;
            s.mx = approach(s.mx, s.tx, 3, dt);
            s.my = approach(s.my, s.ty, 3, dt);
            s.scroll = approach(s.scroll, window.scrollY / Math.max(window.innerHeight, 1), 6, dt);
            watchSections();
            for (let i = 0; i < bands.length; i++) {
                const b = bands[i];
                s.bands[i * 2] = !b.on || i === 0 ? NO_BAND : (b.top - window.scrollY) / viewH;
                s.bands[i * 2 + 1] = !b.on ? NO_BAND : i === bands.length - 1 ? FAR_BELOW : (b.bottom - window.scrollY) / viewH;
            }
            s.light = approach(s.light, lightRef.current, 12, dt);
            draw();
        };

        const start = () => {
            // !res: the context is lost; spinning rAF would only draw nothing.
            if (raf || reduced || document.hidden || !res) return;
            last = 0;
            raf = requestAnimationFrame(tick);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
        };

        const still = () => {
            s.light = lightRef.current;
            draw();
        };

        // Resizing clears the drawing buffer, so repaint at once (no black frame).
        const onResize = () => {
            resize();
            if (reduced) still();
            else draw();
        };
        const onPointer = (e: PointerEvent) => {
            s.tx = e.clientX / Math.max(window.innerWidth, 1);
            s.ty = 1 - e.clientY / Math.max(window.innerHeight, 1);
        };
        const onVisibility = () => (document.hidden ? stop() : start());
        const onLost = (e: Event) => {
            // preventDefault tells the browser we want the context back.
            e.preventDefault();
            stop();
            res = null;
        };
        const onRestored = () => {
            res = setup(gl);
            if (!res) {
                setFallback(true);
                return;
            }
            resize();
            if (reduced) still();
            else start();
        };

        resize();
        if (reduced) {
            redrawRef.current = still;
            still();
        } else {
            // Chakra restores a saved light mode in an effect after the first
            // commit, i.e. after we seeded s.light dark. If the canvas hasn't been
            // seen yet (not drawn, or hidden by the Suspense fallback), jump to
            // the real mode instead of fading from dark in front of the reader.
            redrawRef.current = () => {
                if (!canvas.classList.contains("is-ready") || !canvas.getClientRects().length) {
                    s.light = lightRef.current;
                }
            };
            window.addEventListener("pointermove", onPointer, { passive: true });
            document.addEventListener("visibilitychange", onVisibility);
            start();
        }
        // ResizeObserver also catches the canvas going from display:none (a
        // Suspense boundary hiding the tree) to visible, which fires no resize.
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
        if (ro) ro.observe(canvas);
        else window.addEventListener("resize", onResize, { passive: true });
        canvas.addEventListener("webglcontextlost", onLost);
        canvas.addEventListener("webglcontextrestored", onRestored);

        return () => {
            stop();
            if (io) io.disconnect();
            redrawRef.current = () => undefined;
            window.removeEventListener("pointermove", onPointer);
            document.removeEventListener("visibilitychange", onVisibility);
            if (ro) ro.disconnect();
            else window.removeEventListener("resize", onResize);
            canvas.removeEventListener("webglcontextlost", onLost);
            canvas.removeEventListener("webglcontextrestored", onRestored);
            if (res && !gl.isContextLost()) {
                gl.deleteProgram(res.program);
                gl.deleteBuffer(res.buffer);
            }
        };
    }, [reduced]);

    if (fallback) return <AuroraBackground />;

    return (
        <div className="fx-fluid" aria-hidden="true">
            <canvas ref={canvasRef} className="fx-fluid__canvas" />
            <div className="fx-fluid__vignette" />
            <div className="fx-fluid__grain" />
        </div>
    );
};
