import { RefObject, useEffect } from "react";

/**
 * framer-motion 5.6 has no element-target `useScroll`, so we compute the pinned
 * stage's scroll progress (0..1) ourselves from its bounding rect.
 *
 * The single scroll/resize listener is passive and rAF-throttled with a ticking
 * guard, so we never do more than one measurement per frame and never re-render
 * React in the hot path — `onFrame` writes to the DOM imperatively.
 */
export const useStageScroll = (
    stageRef: RefObject<HTMLElement>,
    onFrame: (progress: number) => void,
    enabled: boolean,
): void => {
    useEffect(() => {
        if (!enabled) return;

        let ticking = false;

        const compute = () => {
            ticking = false;
            const el = stageRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const scrollable = rect.height - window.innerHeight;

            if (scrollable <= 0) {
                onFrame(0);
                return;
            }

            // rect.top starts positive (stage below viewport) and goes negative
            // as the sticky pin scrolls through. Clamp to [0, scrollable].
            const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
            onFrame(scrolled / scrollable);
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(compute);
            }
        };

        compute();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [stageRef, onFrame, enabled]);
};
