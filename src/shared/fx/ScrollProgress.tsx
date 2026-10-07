import { CSSProperties, FC, useEffect, useRef } from "react";

import "shared/fx/ScrollProgress.scss";

/**
 * Slim scroll-progress bar across the top of the page: a crimson→indigo track
 * revealed by clip-path (so the colours stay pinned to page position instead
 * of squashing like scaleX would) with a glowing head riding its edge. The
 * scroll handler is passive + rAF-throttled and writes one CSS variable, so it
 * never re-renders React.
 */
export const ScrollProgress: FC = () => {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;

        const compute = () => {
            ticking = false;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const top = window.scrollY || doc.scrollTop || 0;
            const progress = max > 0 ? Math.min(Math.max(top / max, 0), 1) : 0;
            if (rootRef.current) rootRef.current.style.setProperty("--p", progress.toFixed(4));
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
    }, []);

    return (
        <div ref={rootRef} className="fx-progress" aria-hidden="true" style={{ "--p": 0 } as CSSProperties}>
            <div className="fx-progress__bar" />
            <div className="fx-progress__head" />
        </div>
    );
};
