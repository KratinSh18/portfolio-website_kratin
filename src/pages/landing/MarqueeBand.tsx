import { FC, ReactNode, useEffect, useRef } from "react";

import { useSpring, useVelocity, useViewportScroll } from "framer-motion";

import { Marquee } from "shared/fx/Marquee";
import { useReducedMotion } from "shared/motion/useReducedMotion";

import "pages/landing/MarqueeBand.scss";

// "iOS" keeps its own casing inside the uppercase strip
const DOING: ReactNode[] = [
    "Android",
    <span className="mband__keep-case" key="ios">
        iOS
    </span>,
    "Web",
    "AI Story Engine",
    "LLMs",
    "Payments",
    "Growth",
    "Attribution",
    "Product",
];
const STACK = [
    "React",
    "TypeScript",
    "Kotlin",
    "Jetpack Compose",
    "Swift",
    "SwiftUI",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "AWS",
    "Firebase",
    "BigQuery",
    "LiteLLM",
    "StoreKit 2",
    "Play Billing",
];

/**
 * Two full-bleed parallel tickers, opposite ways, right under the hero. Scroll speed
 * nudges the CSS animations' playbackRate, so the strips rush while the page
 * moves and settle back to cruise — the keyframes stay on the compositor and
 * nothing re-renders.
 */
export const MarqueeBand: FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { scrollY } = useViewportScroll();
    const speed = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30 });

    useEffect(() => {
        const el = ref.current;
        if (!el || reduced || typeof IntersectionObserver === "undefined") return;

        let visible = false;
        let rate = 1;
        const apply = (v: number) => {
            if (!visible || typeof el.getAnimations !== "function") return;
            // quantised so the compositor is only re-synced when the rate really moves
            const next = Math.round((1 + Math.min(Math.abs(v) / 700, 4)) * 10) / 10;
            if (next === rate) return;
            rate = next;
            el.getAnimations({ subtree: true }).forEach((a) => {
                a.playbackRate = rate;
            });
        };
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            el.classList.toggle("is-paused", !visible);
            // the spring may have settled while we were away — resync, or a
            // rate from the last fast scroll would stick until the next one
            apply(speed.get());
        });
        io.observe(el);

        const unsubscribe = speed.onChange(apply);

        return () => {
            io.disconnect();
            unsubscribe();
        };
    }, [reduced, speed]);

    return (
        <div className="mband" ref={ref}>
            <div className="mband__strip mband__strip--a">
                <Marquee items={DOING} speed={32} />
            </div>
            <div className="mband__strip mband__strip--b" aria-hidden="true">
                <Marquee items={STACK} reverse speed={48} separator="+" />
            </div>
        </div>
    );
};
