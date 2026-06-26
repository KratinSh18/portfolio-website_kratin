import { FC } from "react";

import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Tags } from "shared/tags/Tags";
import { ProjectCardFooter } from "shared/project-card-footer/ProjectCardFooter";

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
    return (
        <Flex
            className="fx-scanlines"
            id="featured-project-card"
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
                    <Text className="fx-mono" pt="2" fontSize="0.66rem" color="primary.400">
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

            {/* ---- cover image (height-capped, zooms on hover) ---- */}
            <Box flex={{ base: 1, lg: 0.48 }} minW={0} w="100%">
                <Box
                    overflow="hidden"
                    borderRadius="1rem"
                    border="1px solid var(--fx-glass-border)"
                    sx={{ "&:hover img": { transform: "scale(1.06)" } }}
                >
                    <picture>
                        <source type="image/webp" srcSet={image} />
                        <source type="image/jpeg" srcSet={jpg} />
                        <Image
                            src={jpg}
                            alt={`${title} preview`}
                            w="100%"
                            h={{ base: "200px", lg: "300px" }}
                            objectFit="cover"
                            display="block"
                            transition="transform 0.5s var(--fx-ease-out)"
                        />
                    </picture>
                </Box>
            </Box>
        </Flex>
    );
};
