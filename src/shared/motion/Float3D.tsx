import { FC, ReactNode } from "react";

import { Box } from "@chakra-ui/react";

import { MotionBox } from "shared/motion/MotionPrimitives";
import { useReducedMotion } from "shared/motion/useReducedMotion";

type Direction = "left" | "right" | "up";

interface Props {
    /** Where the panel swings in from. */
    direction?: Direction;
    /** 0..1 — larger travels further and starts deeper in Z. */
    depth?: number;
    delay?: number;
    /** Gentle idle hover once it has settled. */
    bob?: boolean;
    /** How much of the element must be visible before it animates in. */
    amount?: number;
    /** Play on mount instead of on scroll — use for above-the-fold content. */
    appear?: boolean;
    children: ReactNode;
}

/**
 * The single entrance/idle motion primitive that replaces AOS across the site.
 *
 * Three nested layers keep concerns from fighting over the same transform:
 *   perspective wrapper -> entrance (variants) -> idle bob (separate channel).
 * Under reduced motion it collapses to a plain <Box> so nothing is ever
 * stranded at opacity:0.
 */
export const Float3D: FC<Props> = ({
    direction = "up",
    depth = 0.5,
    delay = 0,
    bob = false,
    amount = 0.2,
    appear = false,
    children,
}) => {
    const reduced = useReducedMotion();

    if (reduced) return <Box>{children}</Box>;

    const offX = direction === "left" ? -90 * (0.5 + depth) : direction === "right" ? 90 * (0.5 + depth) : 0;
    const offY = direction === "up" ? 70 : 28;
    const rotY = direction === "left" ? -16 : direction === "right" ? 16 : 0;

    const variants = {
        hidden: { opacity: 0, x: offX, y: offY, rotateY: rotY, z: -220 * depth },
        shown: {
            opacity: 1,
            x: 0,
            y: 0,
            rotateY: 0,
            z: 0,
            transition: { type: "spring", stiffness: 55, damping: 16, delay },
        },
    };

    const trigger = appear
        ? { initial: "hidden", animate: "shown" }
        : {
              initial: "hidden",
              whileInView: "shown",
              viewport: { once: true, amount, margin: "0px 0px -8% 0px" },
          };

    return (
        <Box sx={{ perspective: "1200px" }}>
            <MotionBox
                variants={variants}
                {...trigger}
                style={{ willChange: "transform, opacity", transformStyle: "preserve-3d" }}
            >
                <MotionBox
                    animate={bob ? { y: [0, -8, 0] } : undefined}
                    transition={
                        bob ? { duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 } : undefined
                    }
                >
                    {children}
                </MotionBox>
            </MotionBox>
        </Box>
    );
};
