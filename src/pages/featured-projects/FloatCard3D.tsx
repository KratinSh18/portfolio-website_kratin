import { FC, MouseEvent, ReactNode, useEffect, useRef } from "react";

import { Box } from "@chakra-ui/react";
import { useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

import { usePauseOffscreen } from "shared/fx/usePauseOffscreen";
import { MotionBox } from "shared/motion/MotionPrimitives";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { useStageRegister } from "pages/featured-projects/stage-context";

interface Props {
    index: number;
    children: ReactNode;
}

const SPRING = { stiffness: 150, damping: 18, mass: 0.4 };

/**
 * A single card inside the pinned stage.
 *
 * - The outer `.float-card` is driven imperatively by HorizontalStage (the
 *   scroll-linked 3D transform).
 * - `.float-card__bob` runs a CSS idle hover.
 * - `.float-card__tilt` reacts to the pointer with a springy tilt + a glare that
 *   follows the cursor. Everything pointer-driven is a MotionValue, so mousemove
 *   never re-renders React.
 */
export const FloatCard3D: FC<Props> = ({ index, children }) => {
    const stage = useStageRegister();
    const cardRef = useRef<HTMLDivElement>(null);
    // same gate as the card's own cover tilt: a tap on touch would leave it stuck tilted
    const desktop = useIsDesktopPointer();
    const reduced = useReducedMotion();
    const tilt = desktop && !reduced;

    // the idle bob holds still while the card is off-screen or parked outside the pin
    usePauseOffscreen(cardRef);

    useEffect(() => {
        stage?.register(index, cardRef.current);
        return () => stage?.register(index, null);
    }, [stage, index]);

    const rotateX = useSpring(useMotionValue(0), SPRING);
    const rotateY = useSpring(useMotionValue(0), SPRING);
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const glareOpacity = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
    // plain alpha, no mix-blend-mode: soft-light made each card an isolated group,
    // an extra GPU render surface re-blended on every scroll frame
    const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3), rgba(255,255,255,0) 55%)`;

    const onMove = (e: MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rotateY.set((px - 0.5) * 14);
        rotateX.set(-(py - 0.5) * 14);
        glareX.set(px * 100);
        glareY.set(py * 100);
        glareOpacity.set(0.22);
    };

    const onLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        glareOpacity.set(0);
    };

    return (
        <Box ref={cardRef} className="float-card" flex="0 0 auto" role="listitem">
            <Box className="float-card__bob">
                <MotionBox
                    className="float-card__tilt"
                    onMouseMove={tilt ? onMove : undefined}
                    onMouseLeave={tilt ? onLeave : undefined}
                    style={{
                        rotateX,
                        rotateY,
                        transformPerspective: 1000,
                        transformStyle: "preserve-3d",
                        position: "relative",
                    }}
                >
                    {children}
                    <MotionBox
                        aria-hidden
                        className="float-card__glare"
                        style={{
                            opacity: glareOpacity,
                            background: glare,
                            position: "absolute",
                            inset: 0,
                            borderRadius: "0.75rem",
                            pointerEvents: "none",
                        }}
                    />
                </MotionBox>
            </Box>
        </Box>
    );
};
