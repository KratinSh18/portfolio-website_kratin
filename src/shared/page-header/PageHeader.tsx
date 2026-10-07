import { FC, useEffect, useRef } from "react";

import { motion, useMotionValue, useViewportScroll } from "framer-motion";

import { SplitText } from "shared/motion/SplitText";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { clamp } from "utils/motion";

import "shared/page-header/PageHeader.scss";

interface Props {
    id?: string;
    label: string;
    /** Section number shown as a giant outlined numeral, e.g. "02". */
    index?: string;
}

/**
 * Section header: kicker row, a kinetic char-by-char label, and a giant
 * outlined numeral layered behind it that drifts against the scroll.
 */
export const PageHeader: FC<Props> = ({ id, label, index }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const desktop = useIsDesktopPointer();
    const parallax = desktop && !reduced;

    // Numeral offset = distance of the header from the viewport centre, written
    // straight to a motion value. Subscribed only while parallax is on (touch and
    // reduced motion do no per-scroll work) and measured once on mount, so a
    // mid-page reload doesn't jump on the first scroll. The clamp makes it settle
    // once the header is well off-screen.
    const { scrollY } = useViewportScroll();
    const numeralY = useMotionValue(0);
    useEffect(() => {
        if (!parallax) {
            numeralY.set(0);
            return;
        }
        const update = () => {
            const el = rootRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            numeralY.set(clamp((r.top + r.height / 2 - window.innerHeight / 2) * 0.22, -110, 110));
        };
        update();
        return scrollY.onChange(update);
    }, [parallax, scrollY, numeralY]);

    // Every char is its own transformed layer, which a wrapper-level
    // background-clip:text can't paint through. So each piece carries the
    // label-wide gradient, sized to the label and shifted back by its own
    // offset: the letters line up into one continuous white→crimson sweep.
    // Re-run on resize and once the web font has loaded.
    useEffect(() => {
        const el = labelRef.current;
        if (!el || reduced || typeof ResizeObserver === "undefined") return;

        const paint = () => {
            const width = el.offsetWidth;
            Array.from(el.querySelectorAll<HTMLElement>(".split__piece")).forEach((piece) => {
                piece.style.backgroundSize = `${width}px 100%`;
                piece.style.backgroundPosition = `${-piece.offsetLeft}px 0`;
            });
        };
        const ro = new ResizeObserver(paint);
        ro.observe(el);
        // a wrapped label keeps its width when the web font swaps in, so the
        // observer alone would miss the reflow
        document.fonts?.ready.then(paint);
        return () => ro.disconnect();
    }, [reduced, label]);

    return (
        <div id={id} ref={rootRef} className="page-header">
            {index && (
                <motion.span
                    aria-hidden="true"
                    className="page-header__numeral"
                    style={{ y: numeralY }}
                >
                    {index}
                </motion.span>
            )}

            <div className="page-header__kicker fx-mono">
                <motion.span
                    className="page-header__line"
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
                <span>{index ? `${index} — Section` : "Section"}</span>
            </div>

            <div ref={labelRef} className="page-header__label">
                <SplitText
                    as="h2"
                    text={label}
                    by="chars"
                    // reduced motion renders plain text, so the gradient goes on the heading itself
                    className={reduced ? "fx-gradient-text" : undefined}
                    pieceClassName="page-header__piece"
                />
            </div>
        </div>
    );
};
