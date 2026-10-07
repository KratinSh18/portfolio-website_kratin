import { ElementType, FC } from "react";

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

    if (reduced) return <Tag className={className}>{text}</Tag>;

    const trigger = appear
        ? { initial: "hidden", animate: play ? "shown" : "hidden" }
        : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.35 } };

    const words = text.split(" ");

    return (
        <Tag className={className} aria-label={text}>
            <motion.span className="split" aria-hidden="true" variants={container(stagger, delay)} {...trigger}>
                {words.map((word, w) => (
                    <span key={w}>
                        <span className="split__word">
                            {(by === "chars" ? Array.from(word) : [word]).map((p, i) => (
                                <span className="split__mask" key={i}>
                                    <motion.span
                                        className={`split__piece${pieceClassName ? ` ${pieceClassName}` : ""}`}
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
