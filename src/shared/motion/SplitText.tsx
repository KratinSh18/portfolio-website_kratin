import { ElementType, FC, useEffect, useRef } from "react";

import { motion } from "framer-motion";

import { useReducedMotion } from "shared/motion/useReducedMotion";

import "shared/motion/SplitText.scss";

interface Props {
    text: string;
    /** Split into characters (kinetic display type) or words (sentences). */
    by?: "chars" | "words";
    as?: ElementType;
    className?: string;
    /** Applied to every animated piece — put background-clip:text gradients here, not on the wrapper. */
    pieceClassName?: string;
    delay?: number;
    stagger?: number;
    /** Play on mount (or when `play` flips true) instead of when scrolled into view. */
    appear?: boolean;
    /** With `appear`: hold the pieces hidden until this is true (e.g. the preloader has finished). */
    play?: boolean;
}

const container = (stagger: number, delay: number) => ({
    hidden: {},
    shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const piece = {
    hidden: { y: "115%", rotate: 6, opacity: 0 },
    shown: {
        y: "0%",
        rotate: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 140, damping: 18, mass: 0.9 },
    },
};

/**
 * Each char sits in its own inline-block, so the font's kerning between
 * neighbours is lost ("KRA TIN"). Measure every pair on a canvas, kerned vs.
 * apart, and hand the difference to the mask as --kern (in em, so it holds at
 * any font size).
 */
const applyKerning = (root: HTMLElement) => {
    const first = root.querySelector<HTMLElement>(".split__piece");
    const ctx = document.createElement("canvas").getContext("2d");
    if (!first || !ctx) return;
    const cs = getComputedStyle(first);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} 100px ${cs.fontFamily}`;
    const upper = cs.textTransform === "uppercase";
    const width = (s: string) => ctx.measureText(upper ? s.toUpperCase() : s).width;
    root.querySelectorAll<HTMLElement>(".split__word").forEach((word) => {
        const masks = Array.from(word.children) as HTMLElement[];
        masks.forEach((mask, i) => {
            if (i === 0) return;
            const a = masks[i - 1].textContent || "";
            const b = mask.textContent || "";
            const kern = (width(a + b) - width(a) - width(b)) / 100;
            mask.style.setProperty("--kern", `${kern.toFixed(3)}em`);
        });
    });
};

/**
 * Masked line-reveal: every word (or character) rises out of its own clipping
 * mask. Screen readers get the plain string via aria-label; the pieces are
 * aria-hidden. Reduced motion renders the plain text.
 */
export const SplitText: FC<Props> = ({
    text,
    by = "words",
    as: Tag = "span",
    className,
    pieceClassName,
    delay = 0,
    stagger = by === "chars" ? 0.035 : 0.07,
    appear = false,
    play = true,
}) => {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);

    // once the web font is in, or the measurement is of the fallback
    useEffect(() => {
        const root = ref.current;
        if (!root || by !== "chars") return;
        if (document.fonts) document.fonts.ready.then(() => applyKerning(root));
        else applyKerning(root);
    }, [by, text, reduced]);

    if (reduced) return <Tag className={className}>{text}</Tag>;

    const trigger = appear
        ? { initial: "hidden", animate: play ? "shown" : "hidden" }
        : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.35 } };

    const words = text.split(" ");

    return (
        <Tag className={className} aria-label={text}>
            <motion.span
                ref={ref}
                className="split"
                aria-hidden="true"
                variants={container(stagger, delay)}
                {...trigger}
            >
                {words.map((word, w) => (
                    <span key={w}>
                        <span className="split__word">
                            {(by === "chars" ? Array.from(word) : [word]).map((p, i) => (
                                <span className="split__mask" key={i}>
                                    {/* data-char: lets CSS draw a copy of the glyph in ::after (e.g. a glow layer) */}
                                    <motion.span
                                        className={`split__piece${pieceClassName ? ` ${pieceClassName}` : ""}`}
                                        data-char={by === "chars" ? p : undefined}
                                        variants={piece}
                                    >
                                        {p}
                                    </motion.span>
                                </span>
                            ))}
                        </span>
                        {w < words.length - 1 ? " " : null}
                    </span>
                ))}
            </motion.span>
        </Tag>
    );
};
