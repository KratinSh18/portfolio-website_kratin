import { FC, useEffect, useRef } from "react";

import { motion, MotionValue, useMotionValue, useSpring } from "framer-motion";

import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";

import "shared/fx/Cursor.scss";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, summary, [data-cursor]";
const HTML_CLASS = "has-fx-cursor";

// Moves a spring's value without animating (framer-motion 5 has no jump()).
// set(v, false) skips the spring, but it also records the jump as velocity,
// which the next spring would inherit and fling the ring hundreds of px past
// the pointer; the second call makes prev === current, so velocity is 0.
const snap = (value: MotionValue<number>, v: number) => {
    value.set(v, false);
    value.set(v, false);
};

/**
 * Custom pointer: an exact dot plus a spring-lagged ring that inverts what it
 * passes over (mix-blend difference). It grows over interactive elements and
 * shows a `data-cursor="Label"` when one is set on the target or an ancestor.
 *
 * Desktop fine pointer and full motion only. Position lives in motion values
 * and hover/press state in classes on the root node, so nothing re-renders
 * React while the pointer moves. The native cursor is hidden only by a class
 * added while this one is actually on screen — if JS never runs, or a Suspense
 * fallback hides this tree, the normal cursor stays.
 */
export const Cursor: FC = () => {
    const desktop = useIsDesktopPointer();
    const reduced = useReducedMotion();
    const enabled = desktop && !reduced;

    const rootRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.5 });
    const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.5 });

    useEffect(() => {
        const root = rootRef.current;
        const label = labelRef.current;
        if (!enabled || !root || !label) return;

        const html = document.documentElement;
        let current: Element | null = null;

        // The native cursor goes away only while ours is showing: not before
        // the first move (no cursor at all), not on touch, not off-window.
        const show = (on: boolean) => {
            root.classList.toggle("is-visible", on);
            html.classList.toggle(HTML_CLASS, on);
        };

        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") {
                show(false);
                return;
            }
            if (!root.classList.contains("is-visible")) {
                // Hidden by an ancestor (e.g. a Suspense fallback): keep the native cursor.
                if (!root.getClientRects().length) return;
                // Snap the ring on (re-)entry so it doesn't fly in from its old spot.
                snap(ringX, e.clientX);
                snap(ringY, e.clientY);
                show(true);
            }
            x.set(e.clientX);
            y.set(e.clientY);
        };

        // One delegated listener: pointerover fires on every element the pointer
        // enters, so resolving `closest()` here tracks hover without per-element wiring.
        const onOver = (e: PointerEvent) => {
            const target = e.target instanceof Element ? e.target : null;
            const hit = target ? target.closest(INTERACTIVE) : null;
            if (hit === current) return;
            current = hit;
            const text = (target && target.closest("[data-cursor]")?.getAttribute("data-cursor")) || "";
            // Keep the last text while the badge shrinks away, so it never collapses empty.
            if (text) label.textContent = text;
            root.classList.toggle("is-hover", !!hit);
            root.classList.toggle("has-label", !!text);
        };

        // relatedTarget null = the pointer left the window.
        const onOut = (e: PointerEvent) => {
            if (!e.relatedTarget) show(false);
        };
        const onDown = () => root.classList.add("is-down");
        const onUp = () => root.classList.remove("is-down");

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver, { passive: true });
        document.addEventListener("pointerout", onOut, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });
        window.addEventListener("blur", onUp);
        // A right-click's pointerup is swallowed by the context menu.
        window.addEventListener("contextmenu", onUp);

        return () => {
            html.classList.remove(HTML_CLASS);
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerover", onOver);
            document.removeEventListener("pointerout", onOut);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("blur", onUp);
            window.removeEventListener("contextmenu", onUp);
        };
    }, [enabled, x, y, ringX, ringY]);

    if (!enabled) return null;

    return (
        <div ref={rootRef} className="fx-cursor" aria-hidden="true">
            <motion.div className="fx-cursor__ring" style={{ x: ringX, y: ringY }}>
                <div className="fx-cursor__ring-shape" />
            </motion.div>
            <motion.div className="fx-cursor__badge" style={{ x: ringX, y: ringY }}>
                <span ref={labelRef} className="fx-cursor__label fx-mono" />
            </motion.div>
            <motion.div className="fx-cursor__dot" style={{ x, y }} />
        </div>
    );
};
