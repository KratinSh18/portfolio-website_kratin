import { PointerEvent } from "react";

/**
 * Hands the pointer position to CSS as --mx / --my (px inside the element) so a
 * radial highlight can follow it. Writes a style, never React state, so moving
 * the mouse re-renders nothing. Mouse only — a finger dragging past is not a hover.
 */
export const glare = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
};
