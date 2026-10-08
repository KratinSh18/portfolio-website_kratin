import { FC } from "react";

import { Image, Box, Flex, Heading, Text } from "@chakra-ui/react";

import { Tags } from "shared/tags/Tags";
import { ProjectCardFooter } from "shared/project-card-footer/ProjectCardFooter";

interface Props {
    id: string;
    title: string;
    demo?: string;
    github?: string;
    tags: string[];
    description: string;
    readMore?: string;
    image: string;
    jpg: string;
}

/**
 * Glass card: hovering anywhere lifts it, lights a crimson edge glow and slowly
 * zooms the cover. Transform-free under reduced motion (glow and border stay).
 */
export const OtherProjectCard: FC<Props> = ({ id, title, demo, github, tags, description, readMore, image, jpg }) => {
    return (
        <Flex
            className="fx-glass"
            data-group
            alignItems={{ base: "flex-start", lg: "center" }}
            gap={{ base: 6, lg: 10 }}
            id={`other-project-card-${id}`}
            p={{ base: "5", md: "6" }}
            my={{ base: "5", md: "6" }}
            transition="transform 0.5s var(--fx-ease-out), border-color 0.35s ease, box-shadow 0.5s var(--fx-ease-out)"
            _hover={{
                borderColor: "var(--fx-glass-border-hot)",
                boxShadow:
                    "var(--fx-glass-shadow), 0 0 0 1px var(--fx-glass-border-hot), 0 24px 60px -24px rgba(221, 0, 4, 0.5)",
            }}
            // lift + cover zoom only when motion is welcome; a reduce override
            // couldn't outrank Chakra's [data-group]:hover selector on the image
            sx={{
                "@media (prefers-reduced-motion: no-preference)": {
                    "&:hover": { transform: "translateY(-6px)" },
                    "&:hover img": { transform: "scale(1.08)" },
                },
            }}
        >
            <Box
                flex="0.25"
                display={{ base: "none", md: "block" }}
                overflow="hidden"
                borderRadius="lg"
                border="1px solid var(--fx-glass-border)"
            >
                <picture>
                    <source type="image/webp" srcSet={image}></source>
                    <source type="image/jpeg" srcSet={jpg}></source>
                    <Image
                        ignoreFallback
                        src={image}
                        alt={`${title} cover`}
                        loading="lazy"
                        decoding="async"
                        display="block"
                        w="100%"
                        transition="transform 0.8s var(--fx-ease-out)"
                    />
                </picture>
            </Box>
            {/* short copy: on desktop the buttons sit beside the text, not in a gap below it */}
            <Flex
                w="100%"
                direction={{ base: "column", lg: "row" }}
                alignItems={{ lg: "center" }}
                justifyContent="space-between"
                gap={{ lg: 6 }}
                flex={1}
            >
                <Box>
                    <Heading
                        fontSize="2xl"
                        transition="color 0.3s var(--fx-ease-out)"
                        _groupHover={{ color: "primary.500" }}
                    >
                        {title}
                    </Heading>
                    <Text py="2" color="var(--fx-text-soft)">
                        {description}
                    </Text>
                    <Tags tags={tags} id={id} size="xs" />
                </Box>
                <ProjectCardFooter readMore={readMore} github={github} demo={demo} pt={{ base: "8", lg: "0" }} />
            </Flex>
        </Flex>
    );
};
