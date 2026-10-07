import { FC, useLayoutEffect, useRef } from "react";

import { VisuallyHidden } from "@chakra-ui/react";
import { motion, Variants } from "framer-motion";

import { useReducedMotion } from "shared/motion/useReducedMotion";

interface Stat {
    value: number;
    decimals: number;
    suffix: string;
    label: string;
}

const COUNT_MS = 1600;

const format = (value: number, decimals: number) =>
    value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const list: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.07 } },
};

const tile: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    shown: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 140, damping: 18 } },
};

/**
 * Counts from 0 to the value once it is scrolled into view. The digits are
 * written straight into the DOM from rAF (never React state), so a count is
 * zero re-renders. Reduced motion, or no IntersectionObserver, shows the final
 * value at once. React renders no children here, so it never fights the writes.
 */
const CountUp: FC<Omit<Stat, "label">> = ({ value, decimals, suffix }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const show = (v: number) => {
            el.textContent = format(v, decimals) + suffix;
        };
        if (reduced || typeof IntersectionObserver === "undefined") {
            show(value);
            return;
        }

        show(0);
        let raf = 0;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                const start = performance.now();
                const tick = (now: number) => {
                    const t = Math.min(1, (now - start) / COUNT_MS);
                    // easeOutExpo: races up, then settles onto the real number
                    show(t === 1 ? value : value * (1 - Math.pow(2, -10 * t)));
                    if (t < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.6 },
        );
        io.observe(el);

        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
            show(value);
        };
    }, [value, decimals, suffix, reduced]);

    return <span ref={ref} className="kp-stat__num kp-grad" aria-hidden="true" />;
};

export const ShowcaseStats: FC<{ stats: Stat[]; label: string }> = ({ stats, label }) => {
    const reduced = useReducedMotion();
    const reveal = reduced
        ? {}
        : { variants: list, initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.25 } };

    return (
        <section className="kp-stats-wrap" aria-label={label}>
            <p className="kp-label fx-mono">{label}</p>
            <motion.ul className="kp-stats" {...reveal}>
                {stats.map((s) => (
                    <motion.li className="kp-stat fx-glass" key={s.label} variants={reduced ? undefined : tile}>
                        <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                        <VisuallyHidden>{`${format(s.value, s.decimals)}${s.suffix} `}</VisuallyHidden>
                        <span className="kp-stat__label fx-mono">{s.label}</span>
                    </motion.li>
                ))}
            </motion.ul>
        </section>
    );
};
