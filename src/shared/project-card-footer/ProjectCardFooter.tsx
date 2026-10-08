import { FC } from "react";

import { Button, Flex, FlexProps, IconButton, useBreakpointValue } from "@chakra-ui/react";

import { ArrowRightIcon, GitHubIcon, LinkIcon } from "utils/Icons";
import { open } from "utils/Functions";

interface GitHubButtonProps {
    github?: string;
    display?: any;
}

interface ReadMoreProps {
    readMore?: string;
}

interface LiveDemoProps {
    demo?: string;
    display?: any;
}

interface Props extends GitHubButtonProps, ReadMoreProps, LiveDemoProps {
    pt?: FlexProps["pt"];
}

// Lift + crimson glow on hover, quick shrink on press; flat under reduced motion.
const buttonHover = {
    transition: "background 0.25s ease, box-shadow 0.3s ease, transform 0.25s var(--fx-ease-out)",
    _hover: { transform: "translateY(-2px)", boxShadow: "var(--fx-glow-accent)" },
    _active: { transform: "scale(0.96)" },
    sx: { "@media (prefers-reduced-motion: reduce)": { "&:hover, &:active": { transform: "none" } } },
};

export const ReadMore: FC<ReadMoreProps> = ({ readMore }) => {
    return readMore ? (
        <Button
            variant="link"
            colorScheme="black"
            data-cursor="Open"
            rightIcon={<ArrowRightIcon fontSize="16pt" />}
            onClick={() => open(readMore)}
            sx={{
                "& .chakra-button__icon": { transition: "transform 0.35s var(--fx-ease-out)" },
                "@media (prefers-reduced-motion: no-preference)": {
                    "&:hover .chakra-button__icon": { transform: "translateX(4px)" },
                },
            }}
        >
            Read more
        </Button>
    ) : null;
};

export const GitHubButton: FC<GitHubButtonProps> = ({ github, display }) => {
    const as = useBreakpointValue({ base: IconButton, lg: Button });

    return github ? (
        <Button
            as={as}
            variant="secondary"
            py="5"
            display={display}
            aria-label="GitHub"
            data-cursor="Code"
            leftIcon={<GitHubIcon />}
            icon={<GitHubIcon />}
            onClick={() => open(github)}
            {...buttonHover}
        >
            GitHub
        </Button>
    ) : null;
};

export const LiveDemo: FC<LiveDemoProps> = ({ demo, display }) => {
    const as = useBreakpointValue({ base: IconButton, lg: Button });

    return demo ? (
        <Button
            as={as}
            display={display}
            aria-label="Live demo"
            data-cursor="Open"
            leftIcon={<LinkIcon fontSize="14pt" />}
            icon={<LinkIcon fontSize="14pt" />}
            onClick={() => open(demo)}
            {...buttonHover}
        >
            Live demo
        </Button>
    ) : null;
};

export const ProjectCardFooter: FC<Props> = ({ readMore, github, demo, pt = "8" }) => {
    return (
        <Flex justifyContent={readMore ? "space-between" : "flex-end"} alignItems="center" pt={pt}>
            <ReadMore readMore={readMore} />
            <Flex gap="4" justifyContent="space-between" alignItems="center" display={demo || github ? "flex" : "none"}>
                <LiveDemo demo={demo} />
                <GitHubButton github={github} />
            </Flex>
        </Flex>
    );
};
