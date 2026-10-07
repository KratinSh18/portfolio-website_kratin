import { FC, PointerEvent } from "react";

import { Box, Flex, Heading, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

import { Tags } from "shared/tags/Tags";
import { ProjectCardFooter } from "shared/project-card-footer/ProjectCardFooter";
import { MotionBox } from "shared/motion/MotionPrimitives";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";

export enum ImagePosition {
    Right,
    Left,
}
interface Props {
    id: string;
    title: string;
    year: string;
    location: string;
    demo?: string;
    github?: string;
    tags: string[];
    description: string;
    readMore?: string;
    image: string;
    imagePosition: ImagePosition;
    jpg: string;
}

const SPRING = { stiffness: 160, damping: 18, mass: 0.4 };

// At rest the cover gets no transform at all. framer appends translateZ(0) to every
// transform it writes, which kept each cover (and the glare stacked over it) on its
// own GPU layer and forced a render surface per card for the whole scroll.
const coverTransform = ({ rotateX, rotateY }: { rotateX?: string | number; rotateY?: string | number }) =>
    parseFloat(String(rotateX)) || parseFloat(String(rotateY))
        ? `perspective(900px) rotateX(${rotateX}) rotateY(${rotateY})`
        : "none";

const LayoutMapper: Record<ImagePosition, "row" | "row-reverse"> = {
    [ImagePosition.Right]: "row",
    [ImagePosition.Left]: "row-reverse",
};

/**
 * Compact "featured project" card used inside the pinned horizontal stage.
 *
 * Deliberately landscape + height-bounded: the description is line-clamped and
 * the cover image is height-capped, so a card can never grow taller than the
 * pinned viewport (which previously cut the card off top/bottom).
 *
 * The cover tilts toward the pointer with a glare that follows it. The stage's
 * FloatCard3D already transforms (and tilts) the card wrapper, so this tilt
 * lives on the inner cover frame only and is kept small so the two compound
 * gently. Desktop fine pointer only; all MotionValues, so no re-renders.
 */
export const FeaturedProjectCard: FC<Props> = ({
    id,
    title,
    demo,
    github,
    tags,
    description,
    readMore,
    image,
    imagePosition,
    location,
    year,
    jpg,
}) => {
    const desktop = useIsDesktopPointer();
    const reduced = useReducedMotion();
    const tilt = desktop && !reduced;
    const rotateX = useSpring(0, SPRING);
    const rotateY = useSpring(0, SPRING);
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const glareOpacity = useSpring(0, { stiffness: 120, damping: 20 });
    const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.38), rgba(255,255,255,0) 55%)`;
    const link = demo || github || readMore;
    // the 10px mono meta needs 4.5:1 — primary.400 fell short on the dark glass
    const metaColor = useColorModeValue("primary.600", "primary.200");

    const onMove = (e: PointerEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rotateY.set((px - 0.5) * 10);
        rotateX.set(-(py - 0.5) * 10);
        glareX.set(px * 100);
        glareY.set(py * 100);
        glareOpacity.set(1);
    };
    const onLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        glareOpacity.set(0);
    };

    return (
        <Flex
            p={{ base: "5", lg: "6" }}
            gap={{ base: 5, lg: 7 }}
            align="center"
            direction={{ base: "column", lg: LayoutMapper[imagePosition] }}
            bg="var(--fx-glass-strong)"
            border="1px solid var(--fx-glass-border)"
            borderRadius="1.4rem"
            boxShadow="var(--fx-glass-shadow)"
        >
            {/* ---- text ---- */}
            <Flex direction="column" justifyContent="center" flex={{ base: 1, lg: 0.52 }} minW={0} w="100%">
                <Heading
                    className="fx-gradient-text"
                    fontSize={{ base: "2xl", lg: "3xl" }}
                    lineHeight="1.1"
                    display="inline-block"
                >
                    {title}
                </Heading>

                {(year || location) && (
                    <Text className="fx-mono" pt="2" fontSize="0.66rem" color={metaColor}>
                        {year} {year && location ? "·" : ""} {location}
                    </Text>
                )}

                <Text
                    fontSize={{ base: "sm", lg: "md" }}
                    pt="3"
                    color="var(--fx-text-soft)"
                    lineHeight="1.55"
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: "6",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {description}
                </Text>

                <Box pt="3">
                    <Tags tags={tags} id={id} size="xs" />
                </Box>

                <ProjectCardFooter readMore={readMore} github={github} demo={demo} />
            </Flex>

            {/* ---- cover image (height-capped, tilts + zooms on hover) ---- */}
            {/* tabIndex -1: the GitHub / demo buttons already give keyboard users this link */}
            <Box
                // cast: Chakra types a union `as` with div props only (no href); a div simply gets none
                as={(link ? "a" : "div") as "a"}
                href={link}
                target={link ? "_blank" : undefined}
                rel={link ? "noopener noreferrer" : undefined}
                tabIndex={link ? -1 : undefined}
                data-cursor={link ? "View" : undefined}
                display="block"
                flex={{ base: 1, lg: 0.48 }}
                minW={0}
                w="100%"
                onPointerMove={tilt ? onMove : undefined}
                onPointerLeave={tilt ? onLeave : undefined}
            >
                <MotionBox
                    position="relative"
                    overflow="hidden"
                    borderRadius="1rem"
                    border="1px solid var(--fx-glass-border)"
                    style={{ rotateX, rotateY }}
                    transformTemplate={coverTransform}
                    sx={{
                        "@media (prefers-reduced-motion: no-preference)": { "&:hover img": { transform: "scale(1.06)" } },
                    }}
                >
                    <picture>
                        <source type="image/webp" srcSet={image} />
                        <source type="image/jpeg" srcSet={jpg} />
                        <Image
                            src={jpg}
                            alt={`${title} preview`}
                            loading="lazy"
                            decoding="async"
                            w="100%"
                            h={{ base: "200px", lg: "300px" }}
                            objectFit="cover"
                            display="block"
                            transition="transform 0.5s var(--fx-ease-out)"
                        />
                    </picture>
                    <MotionBox
                        aria-hidden
                        position="absolute"
                        inset="0"
                        pointerEvents="none"
                        style={{ opacity: glareOpacity, background: glare }}
                    />
                </MotionBox>
            </Box>
        </Flex>
    );
};
