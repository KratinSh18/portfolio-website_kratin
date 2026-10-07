import { FC, ReactNode, useCallback, useEffect, useMemo, useRef } from "react";

import { Box } from "@chakra-ui/react";

import { SwipeDeck } from "shared/deck/SwipeDeck";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { clamp } from "utils/motion";
import { useStageScroll } from "utils/useStageScroll";

import { FloatCard3D } from "pages/featured-projects/FloatCard3D";
import { StageContext } from "pages/featured-projects/stage-context";

import "pages/featured-projects/HorizontalStage.scss";

interface Props {
    count: number;
    ariaLabel?: string;
    renderCard: (index: number) => ReactNode;
}

const GAP = 48;

/**
 * Desktop: a pinned, cinematic horizontal scroll-jack. Scrolling down translates
 * a flex track sideways while each card computes its own 3D transform from its
 * distance to the viewport centre — so projects float past, the centred one crisp
 * and facing you, neighbours angled and receding.
 *
 * Touch / small screens / reduced-motion: the same cards become a native
 * scroll-snap SwipeDeck (no scroll hijacking).
 */
export const HorizontalStage: FC<Props> = ({ count, ariaLabel = "Featured projects", renderCard }) => {
    const reduced = useReducedMotion();
    const desktop = useIsDesktopPointer();
    const enableJack = desktop && !reduced;

    const stageRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<Array<HTMLElement | null>>([]);
    const metricsRef = useRef({ pinW: 0, cardW: 0, padX: 0, max: 1 });
    // last progress drawn: the scroll listener runs page-wide, and outside the pinned
    // range progress sits at 0 or 1, so identical frames are skipped
    const progressRef = useRef(-1);

    const register = useCallback((index: number, el: HTMLElement | null) => {
        cardsRef.current[index] = el;
    }, []);

    const measure = useCallback(() => {
        const pin = pinRef.current;
        const track = trackRef.current;
        if (!pin || !track) return;

        const pinW = pin.clientWidth;
        // Landscape card: wide enough that the description isn't a tall narrow
        // column, capped so it never dominates a large monitor.
        const cardW = Math.round(Math.min(pinW * 0.66, 880));
        const padX = Math.max((pinW - cardW) / 2, 0);

        track.style.paddingLeft = `${padX}px`;
        track.style.paddingRight = `${padX}px`;
        track.style.gap = `${GAP}px`;
        cardsRef.current.forEach((el) => {
            if (el) el.style.width = `${cardW}px`;
        });

        const max = Math.max(track.scrollWidth - pinW, 1);
        metricsRef.current = { pinW, cardW, padX, max };
    }, []);

    const onFrame = useCallback((progress: number) => {
        const track = trackRef.current;
        if (!track || progress === progressRef.current) return;
        progressRef.current = progress;

        const { pinW, cardW, padX, max } = metricsRef.current;
        const translate = -progress * max;
        track.style.transform = `translate3d(${translate}px, 0, 0)`;

        const halfPin = pinW / 2;
        const cards = cardsRef.current;
        for (let i = 0; i < cards.length; i++) {
            const el = cards[i];
            if (!el) continue;
            const centerX = padX + i * (cardW + GAP) + cardW / 2 + translate;
            const d = clamp((centerX - halfPin) / halfPin, -1, 1);
            const ad = Math.abs(d);
            el.style.transform = `translate3d(0, ${ad * 26}px, ${-ad * 280}px) rotateY(${d * 24}deg) scale(${
                1 - ad * 0.12
            })`;
            el.style.opacity = String(1 - ad * 0.45);
            // z-index and pointer-events are not compositor-only: a new z-index every frame
            // re-ran paint + layerization for the whole stage, so step it and write on change
            const z = String(10 - Math.round(ad * 10));
            if (el.style.zIndex !== z) el.style.zIndex = z;
            const pe = ad < 0.35 ? "auto" : "none";
            if (el.style.pointerEvents !== pe) el.style.pointerEvents = pe;
        }
    }, []);

    useStageScroll(stageRef, onFrame, enableJack);

    useEffect(() => {
        if (!enableJack) return;

        // redraw at the current scroll position, not 0: a late image load or resize
        // mid-stage used to snap every card back to the start for a frame
        const reflow = () => {
            measure();
            const progress = Math.max(progressRef.current, 0);
            progressRef.current = -1;
            onFrame(progress);
        };
        reflow();

        window.addEventListener("resize", reflow, { passive: true });
        const settle = window.setTimeout(reflow, 400);

        const track = trackRef.current;
        const imgs = track ? Array.from(track.querySelectorAll("img")) : [];
        imgs.forEach((img) => {
            // cards parked off to the side are clipped by the pin, so native lazy loading
            // would only start each fetch as the card slides in (a blank cover mid-scroll)
            img.loading = "eager";
            img.addEventListener("load", reflow);
        });

        let ro: ResizeObserver | undefined;
        if (typeof ResizeObserver !== "undefined" && track) {
            ro = new ResizeObserver(reflow);
            ro.observe(track);
        }

        return () => {
            window.removeEventListener("resize", reflow);
            window.clearTimeout(settle);
            imgs.forEach((img) => img.removeEventListener("load", reflow));
            ro?.disconnect();
        };
    }, [enableJack, measure, onFrame]);

    const indices = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

    if (!enableJack) {
        return <SwipeDeck ariaLabel={ariaLabel}>{indices.map((i) => renderCard(i))}</SwipeDeck>;
    }

    return (
        <StageContext.Provider value={{ register }}>
            <Box ref={stageRef} className="stage" style={{ height: `${(count + 0.6) * 100}vh` }}>
                <Box ref={pinRef} className="pin">
                    <Box ref={trackRef} className="track" role="list" aria-label={ariaLabel}>
                        {indices.map((i) => (
                            <FloatCard3D key={i} index={i}>
                                {renderCard(i)}
                            </FloatCard3D>
                        ))}
                    </Box>
                </Box>
            </Box>
        </StageContext.Provider>
    );
};
