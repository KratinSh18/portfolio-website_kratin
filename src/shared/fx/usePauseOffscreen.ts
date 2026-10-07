import { RefObject, useEffect } from "react";

/**
 * Holds every CSS loop inside `ref` still while it is off-screen (the global
 * `.is-paused` rule in fx.scss) — a class flip, no re-render. Chrome cannot
 * run a loop on the compositor for an element it has not painted, so a
 * far-off-screen one ticks on the main thread and re-layerizes the whole page
 * every frame; paused, it costs nothing.
 */
export const usePauseOffscreen = (ref: RefObject<HTMLElement>): void => {
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(([entry]) => el.classList.toggle("is-paused", !entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, [ref]);
};
