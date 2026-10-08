import { FC, useEffect, useRef } from "react";

import { motion } from "framer-motion";

import { SplitText } from "shared/motion/SplitText";
import { useReducedMotion } from "shared/motion/useReducedMotion";

import "shared/page-header/PageHeader.scss";

interface Props {
    id?: string;
    label: string;
    /** Section number shown in the kicker, e.g. "02". */
    index?: string;
}

/**
 * Section header: a kicker row ("02 · Section") over a kinetic char-by-char
 * label. Nothing sits behind the title (the old giant numeral was clutter).
 */
export const PageHeader: FC<Props> = ({ id, label, index }) => {
    const labelRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();

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
        <div id={id} className="page-header">
            <div className="page-header__kicker fx-mono">
                <motion.span
                    className="page-header__line"
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
                <span>{index ? `${index} · Section` : "Section"}</span>
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
