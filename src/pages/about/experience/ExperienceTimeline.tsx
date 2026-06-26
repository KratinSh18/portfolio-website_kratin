import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

import { Box, Flex, Heading, Text } from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { DeckArrows } from "shared/deck/DeckArrows";
import { DeckProgress } from "shared/deck/DeckProgress";
import { useDeckScroll } from "shared/deck/useDeckScroll";
import { ChevronDownIcon } from "utils/Icons";

import "pages/about/experience/ExperienceTimeline.scss";

/**
 * Horizontal work-experience timeline. Each role is a glass card hanging off a
 * neon node on the spine.
 *
 * Collapsed by default: a card shows only a one-line brief. Clicking its node
 * (or the "View details" toggle) expands it to the full responsibilities; only
 * one card is open at a time. When everything fits, the deck arrows/dots are
 * hidden and the cards are centred.
 */
export const ExperienceTimeline: FC = () => {
    const experiences = configs.about.experiences;
    const trackRef = useRef<HTMLDivElement>(null);
    const { index, count, canPrev, canNext, scrollToIndex } = useDeckScroll(trackRef, experiences.length);
    const [overflowing, setOverflowing] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 4);
        check();
        const settle = window.setTimeout(check, 400);
        window.addEventListener("resize", check, { passive: true });
        let ro: ResizeObserver | undefined;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(check);
            ro.observe(el);
        }
        return () => {
            window.clearTimeout(settle);
            window.removeEventListener("resize", check);
            ro?.disconnect();
        };
    }, []);

    const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

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
        <Box className="xptl">
            <Box
                ref={trackRef}
                className="xptl__track"
                style={{ justifyContent: overflowing ? "flex-start" : "center" }}
                tabIndex={overflowing ? 0 : -1}
                role="list"
                aria-label="Work experience timeline"
                onKeyDown={onKeyDown}
            >
                {experiences.map((exp) => {
                    const isOpen = openId === exp.id;
                    const hasMore = exp.description.length > 1;
                    const panelId = `xp-panel-${exp.id}`;

                    return (
                        <Box
                            as="article"
                            className={`xptl__item${isOpen ? " is-open" : ""}`}
                            data-deck-item
                            role="listitem"
                            key={exp.id}
                        >
                            <button
                                type="button"
                                className="xptl__node"
                                onClick={() => toggle(exp.id)}
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                aria-label={`${isOpen ? "Hide" : "Show"} details for ${exp.company}`}
                            />
                            <Box className="xptl__card fx-glass">
                                <Text className="xptl__date fx-mono">{exp.duration}</Text>
                                <Heading className="xptl__company" fontSize="2xl">
                                    {exp.company}
                                </Heading>
                                <Text className="xptl__role">{exp.position}</Text>

                                <Box id={panelId} className="xptl__body">
                                    {isOpen ? (
                                        <Box as="ul" className="xptl__list">
                                            {exp.description.map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Text className="xptl__brief">{exp.description[0]}</Text>
                                    )}
                                </Box>

                                {hasMore && (
                                    <button
                                        type="button"
                                        className="xptl__toggle"
                                        onClick={() => toggle(exp.id)}
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                    >
                                        {isOpen ? "Show less" : `View details · ${exp.description.length} points`}
                                        <Box as="span" className="xptl__chev" aria-hidden="true">
                                            <ChevronDownIcon />
                                        </Box>
                                    </button>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {overflowing && (
                <Flex mt="2" alignItems="center" justifyContent="center" gap={{ base: 4, md: 6 }}>
                    <DeckArrows side="prev" disabled={!canPrev} onClick={() => scrollToIndex(index - 1)} />
                    <DeckProgress count={count} index={index} onDot={scrollToIndex} />
                    <DeckArrows side="next" disabled={!canNext} onClick={() => scrollToIndex(index + 1)} />
                </Flex>
            )}
        </Box>
    );
};
