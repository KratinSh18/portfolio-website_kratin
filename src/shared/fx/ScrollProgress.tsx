import { FC, useEffect, useRef } from "react";

import "shared/fx/ScrollProgress.scss";

/**
 * Slim scroll-progress bar across the top of the page. The scroll handler is
 * passive + rAF-throttled and writes the scale straight to the DOM, so it never
 * re-renders React.
 */
export const ScrollProgress: FC = () => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;

        const compute = () => {
            ticking = false;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const top = window.scrollY || doc.scrollTop || 0;
            const progress = max > 0 ? Math.min(Math.max(top / max, 0), 1) : 0;
            if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
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
        <div className="fx-progress" aria-hidden="true">
            <div ref={barRef} className="fx-progress__bar" />
        </div>
    );
};
