import { FC, PointerEvent, ReactNode, useRef } from "react";

import { motion, useSpring } from "framer-motion";

import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";

interface Props {
    /** 0..1 — how far the child follows the pointer (fraction of the offset from centre). */
    strength?: number;
    children: ReactNode;
}

/**
 * Pulls its child toward the pointer while hovered and springs back on leave.
 * Desktop fine-pointer only; touch and reduced motion get the child untouched.
 */
export const Magnetic: FC<Props> = ({ strength = 0.35, children }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const desktop = useIsDesktopPointer();
    const reduced = useReducedMotion();
    const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
    const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });

    if (!desktop || reduced) return <>{children}</>;

    const onMove = (e: PointerEvent<HTMLSpanElement>) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.span
            ref={ref}
            style={{ x, y, display: "inline-block" }}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
        >
            {children}
        </motion.span>
    );
};
