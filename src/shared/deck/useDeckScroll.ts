import { RefObject, useCallback, useEffect, useState } from "react";

interface DeckState {
    index: number;
    count: number;
    canPrev: boolean;
    canNext: boolean;
    scrollToIndex: (index: number) => void;
}

/**
 * Tracks the active slide of a native scroll-snap deck (the item whose centre is
 * closest to the track centre) and exposes a smooth `scrollToIndex`. The scroll
 * listener is passive + rAF-throttled.
 */
export const useDeckScroll = (trackRef: RefObject<HTMLElement>, count: number): DeckState => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        let ticking = false;

        const compute = () => {
            ticking = false;
            const items = Array.from(el.querySelectorAll<HTMLElement>("[data-deck-item]"));
            if (!items.length) return;

            const center = el.scrollLeft + el.clientWidth / 2;
            let best = 0;
            let bestDist = Infinity;
            items.forEach((item, i) => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const dist = Math.abs(itemCenter - center);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = i;
                }
            });
            setIndex(best);
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(compute);
            }
        };

        compute();
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [trackRef, count]);

    const scrollToIndex = useCallback(
        (target: number) => {
            const el = trackRef.current;
            if (!el) return;
            const items = Array.from(el.querySelectorAll<HTMLElement>("[data-deck-item]"));
            const clamped = Math.min(Math.max(target, 0), items.length - 1);
            const item = items[clamped];
            if (!item) return;
            const left = item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2;
            el.scrollTo({ left, behavior: "smooth" });
        },
        [trackRef],
    );

    return { index, count, canPrev: index > 0, canNext: index < count - 1, scrollToIndex };
};
