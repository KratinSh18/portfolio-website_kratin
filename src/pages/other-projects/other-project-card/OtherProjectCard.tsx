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

export const OtherProjectCard: FC<Props> = ({ id, title, demo, github, tags, description, readMore, image, jpg }) => {
    return (
        <Flex
            className="fx-glass"
            alignItems={{ base: "flex-start", lg: "center" }}
            gap={{ base: 6, lg: 10 }}
            id={`other-project-card-${id}`}
            p={{ base: "5", md: "6" }}
            my={{ base: "5", md: "6" }}
            transition="all 0.3s var(--fx-ease-out)"
            _hover={{ transform: "translateY(-4px)", borderColor: "var(--fx-glass-border-hot)" }}
        >
            <Box flex="0.25" display={{ base: "none", md: "block" }}>
                <picture>
                    <source type="image/webp" srcSet={image}></source>
                    <source type="image/jpeg" srcSet={jpg}></source>
                    <Image
                        ignoreFallback
                        src={image}
                        borderRadius="lg"
                        alt={`${title}-cover-image`}
                        border="1px solid var(--fx-glass-border)"
                        transition="all 0.35s var(--fx-ease-out)"
                        _hover={{ boxShadow: "var(--fx-glow-accent)", transform: "scale(1.03)" }}
                    />
                </picture>
            </Box>
            <Flex w="100%" direction="column" alignContent="center" flex={1}>
                <Box>
                    <Heading fontSize="2xl">{title}</Heading>
                    <Text py="2">{description}</Text>
                    <Tags tags={tags} id={id} size="xs" />
                </Box>
                <ProjectCardFooter readMore={readMore} github={github} demo={demo} />
            </Flex>
        </Flex>
    );
};
