import { FC, useEffect, useRef, useState } from "react";

import { useColorMode } from "@chakra-ui/react";

import { AuroraBackground } from "shared/fx/AuroraBackground";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { KukuPlayShowcaseId } from "utils/useScroll";

import "shared/fx/FluidBackground.scss";

// The product showcase section tints the flow indigo while on screen.
const PRODUCT_SECTION_ID = KukuPlayShowcaseId;

// Internal resolution: half the (capped) device pixels. The flow is soft by
// nature, so CSS stretching it costs nothing visible and saves ~75% of the work.
const RENDER_SCALE = 0.5;
const MAX_DPR = 1.5;
// rAF runs at 120Hz on ProMotion screens; the flow is slow enough that 60fps
// is indistinguishable and halves the GPU bill.
const MIN_FRAME_MS = 1000 / 60 - 2;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Domain-warped fbm (IQ's "warp of a warp"): q warps p, r warps p by q, the
// final field f is sampled through r. Two extra taps of the last fbm give a
// surface normal for a soft specular sheen. Dark mode is kept deliberately low
// in luminance so body text stays readable with no extra backdrop.
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
uniform float u_product;
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
    vec2 w = p + 3.5 * r;
    float f = fbm(w);

    const float e = 0.03;
    float fx = fbm(w + vec2(e, 0.0));
    float fy = fbm(w + vec2(0.0, e));
    vec3 n = normalize(vec3((f - fx) / e, (f - fy) / e, 2.2));
    vec3 lightDir = normalize(vec3(-0.45, 0.6, 0.65));
    float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 22.0);

    float cur = smoothstep(0.38, 0.9, f);                       // main molten current
    float counter = smoothstep(0.45, 0.95, length(q)) * (1.0 - cur); // cool counter-current
    float hot = smoothstep(0.55, 0.85, r.y) * cur;               // molten core

    vec3 crimson = vec3(0.867, 0.0, 0.016);
    vec3 crimsonHot = vec3(0.961, 0.106, 0.173);
    vec3 indigo = vec3(0.388, 0.4, 0.945);
    vec3 indigoHot = vec3(0.506, 0.549, 0.973);

    // Inside the product showcase the indigo counter-current takes over.
    vec3 mainC = mix(crimson, indigo, u_product);
    vec3 counterC = mix(indigo, crimson, u_product);
    vec3 hotC = mix(crimsonHot, indigoHot, u_product);

    vec3 dark = vec3(0.047, 0.055, 0.075);
    dark = mix(dark, mainC * 0.42, cur * 0.9);
    dark = mix(dark, counterC * 0.26, counter * 0.6);
    dark += hotC * hot * 0.22;
    dark += mainC * infl * 0.035;
    dark += vec3(0.9, 0.92, 1.0) * spec * (0.025 + 0.06 * cur);

    // Light: ink dropped in water on paper — tints only, never dark.
    vec3 paper = vec3(0.965, 0.969, 0.976);
    vec3 inkMain = mix(vec3(0.97, 0.80, 0.82), vec3(0.83, 0.84, 0.98), u_product);
    vec3 inkCounter = mix(vec3(0.85, 0.86, 0.98), vec3(0.97, 0.84, 0.85), u_product);
    vec3 light = paper;
    light = mix(light, inkMain, cur * 0.75);
    light = mix(light, inkCounter, counter * 0.55);
    light = mix(light, inkMain * 0.94, hot * 0.35);
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
    u: Record<"res" | "time" | "mouse" | "scroll" | "product" | "light", WebGLUniformLocation | null>;
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
            product: at("u_product"),
            light: at("u_light"),
        },
    };
};

/** 0..1 — how much of the viewport the product showcase fills (60% = fully indigo). */
const productInView = (): number => {
    const el = document.getElementById(PRODUCT_SECTION_ID);
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return Math.min(Math.max(visible / (vh * 0.6), 0), 1);
};

/** Frame-rate independent easing toward a target (k ≈ 1/time-constant in seconds). */
const approach = (from: number, to: number, k: number, dt: number) => from + (to - from) * (1 - Math.exp(-k * dt));

/**
 * The site's living backdrop: a molten crimson liquid on near-black with an
 * indigo counter-current, rendered by one raw WebGL1 fragment shader. Every
 * input (time, pointer, scroll, product section, colour mode) is a uniform fed
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
        const s = {
            time: 8 + Math.random() * 40, // start somewhere different each visit
            mx: 0.62,
            my: 0.58,
            tx: 0.62,
            ty: 0.58,
            // Seeded from the live page so a reload mid-page doesn't swoosh into place.
            scroll: reduced ? 0 : window.scrollY / Math.max(window.innerHeight, 1),
            product: reduced ? 0 : productInView(),
            light: lightRef.current,
        };

        const resize = () => {
            const scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE;
            const w = Math.max(1, Math.round(canvas.clientWidth * scale));
            const h = Math.max(1, Math.round(canvas.clientHeight * scale));
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
            gl.uniform1f(res.u.product, s.product);
            gl.uniform1f(res.u.light, s.light);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            canvas.classList.add("is-ready");
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
            s.product = approach(s.product, productInView(), 2.5, dt);
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
