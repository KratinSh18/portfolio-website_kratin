import { FC, KeyboardEvent, ReactNode, useRef } from "react";

import { Box, Flex } from "@chakra-ui/react";

import { DeckArrows } from "shared/deck/DeckArrows";
import { DeckProgress } from "shared/deck/DeckProgress";
import { useDeckScroll } from "shared/deck/useDeckScroll";
import { useReducedMotion } from "shared/motion/useReducedMotion";

interface Props {
    ariaLabel?: string;
    children: ReactNode[];
}

/**
 * Native CSS scroll-snap horizontal deck used on touch / small screens and under
 * reduced motion. Real momentum scrolling, `touch-action: pan-x` so the page
 * still scrolls vertically past it (no scroll trapping), plus arrows, dots and
 * keyboard support.
 */
export const SwipeDeck: FC<Props> = ({ ariaLabel = "Carousel", children }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { index, count, canPrev, canNext, scrollToIndex } = useDeckScroll(trackRef, children.length);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollToIndex(index + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollToIndex(index - 1);
        } else if (e.key === "Home") {
            e.preventDefault();
            scrollToIndex(0);
        } else if (e.key === "End") {
            e.preventDefault();
            scrollToIndex(count - 1);
        }
    };

    return (
        <Box position="relative" py={{ base: 4, md: 8 }}>
            <Box
                ref={trackRef}
                tabIndex={0}
                role="group"
                aria-roledescription="carousel"
                aria-label={ariaLabel}
                onKeyDown={onKeyDown}
                display="flex"
                gap={{ base: 4, md: 8 }}
                overflowX="auto"
                py={{ base: 6, md: 10 }}
                px={{ base: 6, md: 10 }}
                sx={{
                    scrollSnapType: reduced ? "none" : "x mandatory",
                    scrollBehavior: reduced ? "auto" : "smooth",
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-x",
                    perspective: "1200px",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.500",
                        outlineOffset: "4px",
                        borderRadius: "lg",
                    },
                }}
            >
                {children.map((child, i) => (
                    <Box
                        key={i}
                        data-deck-item
                        role="listitem"
                        flex="0 0 auto"
                        w={{ base: "84vw", sm: "70vw", md: "520px" }}
                        sx={{ scrollSnapAlign: "center", scrollSnapStop: "always" }}
                    >
                        {child}
                    </Box>
                ))}
            </Box>

            <Flex mt={{ base: 4, md: 6 }} alignItems="center" justifyContent="center" gap={{ base: 4, md: 6 }}>
                <DeckArrows side="prev" disabled={!canPrev} onClick={() => scrollToIndex(index - 1)} />
                <DeckProgress count={count} index={index} onDot={scrollToIndex} />
                <DeckArrows side="next" disabled={!canNext} onClick={() => scrollToIndex(index + 1)} />
            </Flex>
        </Box>
    );
};
