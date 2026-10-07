import { FC, useEffect, useRef, useState } from "react";

import { VisuallyHidden } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";

// configs, not shared/content/Content — that module drags react-markdown
// into the main bundle, and the intro must be first to paint.
import { configs } from "shared/content/configs";
import { markPreloaderDone, usePreloaderDone } from "shared/fx/preloader-state";

import "shared/fx/Preloader.scss";

const SESSION_KEY = "fx-intro-seen";
const COUNT_MS = 700;
const HOLD_MS = 60;
// The script face is only fetched once something uses it, i.e. by this very
// intro on a first visit. Wait this long at most for it before writing, so the
// name doesn't write itself in a fallback cursive and then jump to the real one.
const FONT_WAIT_MS = 450;
const CURTAIN_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1]; // --fx-ease-in-out

const easeInOutQuart = (p: number) => (p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2);
const pad3 = (n: number) => ("00" + n).slice(-3);

// Decided once, on the first render: never for reduced motion, a background
// tab (rAF is paused there) or a repeat visit in the same browser session.
// Read-only — the flag is written in an effect, so StrictMode's double render
// can't hide the intro from itself.
const shouldShow = (): boolean => {
    if (typeof window === "undefined" || document.hidden) return false;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    try {
        return !window.sessionStorage.getItem(SESSION_KEY);
    } catch {
        return true; // storage blocked (private mode, policy): just show it
    }
};

/**
 * The opening beat: the signature writes itself in while a mono counter races
 * 0→100 along a thin crimson line, then an ink curtain lifts with a crimson
 * panel trailing it. ~1.4s, once per session, skippable by click or any key.
 *
 * markPreloaderDone() fires the moment the curtain starts to lift, so hero
 * entrances play in view. Frame work writes straight to the DOM via refs.
 */
export const Preloader: FC = () => {
    const [visible, setVisible] = useState(shouldShow);
    const signalled = usePreloaderDone();
    const rootRef = useRef<HTMLDivElement>(null);
    const sigRef = useRef<HTMLSpanElement>(null);
    const countRef = useRef<HTMLSpanElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<() => void>(() => undefined);

    useEffect(() => {
        if (!visible) {
            markPreloaderDone();
            return;
        }
        try {
            window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
            // nothing to remember with; the intro just plays again next load
        }

        // Lock scroll, restoring the exact inline values we found.
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.overflow;
        const prevBody = body.style.overflow;
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        let locked = true;
        const unlock = () => {
            if (!locked) return;
            locked = false;
            html.style.overflow = prevHtml;
            body.style.overflow = prevBody;
        };

        let raf = 0;
        let hold = 0;
        let shownAt = 0;
        let start = 0;
        let closed = false;
        let fontReady = !document.fonts;
        if (document.fonts) {
            const ready = () => {
                fontReady = true;
            };
            document.fonts.load('1em "Signature"').then(ready, ready);
        }

        const close = () => {
            if (closed) return;
            closed = true;
            cancelAnimationFrame(raf);
            window.clearTimeout(hold);
            // The overlay lingers while the curtain animates out; let clicks through now.
            if (rootRef.current) rootRef.current.style.pointerEvents = "none";
            markPreloaderDone();
            unlock();
            setVisible(false);
        };
        closeRef.current = close;

        const tick = (now: number) => {
            const root = rootRef.current;
            // A Suspense boundary can mount us hidden (display:none) while
            // lazy chunks load; don't spend the intro until it can be seen.
            if (!root || !root.getClientRects().length) {
                raf = requestAnimationFrame(tick);
                return;
            }
            if (!shownAt) shownAt = now;
            if (!fontReady && now - shownAt < FONT_WAIT_MS) {
                raf = requestAnimationFrame(tick);
                return;
            }
            if (!start) start = now;
            const p = Math.min((now - start) / COUNT_MS, 1);
            const e = easeInOutQuart(p);
            if (countRef.current) countRef.current.textContent = pad3(Math.round(e * 100));
            if (lineRef.current) lineRef.current.style.transform = `scaleX(${e})`;
            if (sigRef.current) {
                sigRef.current.style.clipPath = p < 1 ? `inset(0 ${((1 - e) * 100).toFixed(2)}% 0 0)` : "none";
            }
            if (p < 1) raf = requestAnimationFrame(tick);
            else hold = window.setTimeout(close, HOLD_MS);
        };

        raf = requestAnimationFrame(tick);
        window.addEventListener("keydown", close);

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(hold);
            window.removeEventListener("keydown", close);
            closeRef.current = () => undefined;
            unlock();
        };
    }, [visible]);

    // preloader-state's 2.5s safety ceiling fired first (e.g. slow chunks):
    // the hero is already playing, so get out of its way.
    useEffect(() => {
        if (signalled) closeRef.current();
    }, [signalled]);

    return (
        <>
            {visible && <VisuallyHidden role="status">Loading</VisuallyHidden>}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        key="fx-preloader"
                        ref={rootRef}
                        className="fx-preloader"
                        aria-hidden="true"
                        onClick={() => closeRef.current()}
                    >
                        <motion.div
                            className="fx-preloader__panel fx-preloader__panel--accent"
                            exit={{ y: "-100%", transition: { duration: 0.55, ease: CURTAIN_EASE, delay: 0.08 } }}
                        />
                        <motion.div
                            className="fx-preloader__panel fx-preloader__panel--ink"
                            exit={{ y: "-100%", transition: { duration: 0.55, ease: CURTAIN_EASE } }}
                        />
                        <motion.div
                            className="fx-preloader__inner"
                            exit={{ opacity: 0, y: -48, transition: { duration: 0.3, ease: CURTAIN_EASE } }}
                        >
                            <div className="fx-preloader__mark">
                                <span className="fx-preloader__sig fx-preloader__sig--ghost">{configs.common.name}</span>
                                <span ref={sigRef} className="fx-preloader__sig fx-preloader__sig--ink">
                                    {configs.common.name}
                                </span>
                            </div>

                            <div className="fx-preloader__foot">
                                <div className="fx-preloader__meta">
                                    <span className="fx-mono">Portfolio</span>
                                    <span ref={countRef} className="fx-preloader__count fx-mono">
                                        000
                                    </span>
                                </div>
                                <div className="fx-preloader__track">
                                    <div ref={lineRef} className="fx-preloader__line" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
