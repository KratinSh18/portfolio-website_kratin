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

// Lift + soft accent glow on hover, quick shrink on press; flat under reduced motion.
// In sx, not _hover/_active: Chakra merges style props over the variant shallowly, so
// a _hover prop would drop the variant's own hover/press fill.
const buttonHover = {
    transition: "background 0.25s ease, box-shadow 0.3s ease, transform 0.25s var(--fx-ease-out)",
    sx: {
        "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--fx-glow-accent)" },
        "&:active": { transform: "scale(0.96)" },
        "@media (prefers-reduced-motion: reduce)": { "&:hover, &:active": { transform: "none" } },
    },
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

// One component per breakpoint, never <Button as={IconButton|Button}>: that nests a
// second Button whose default solid variant paints the hover/press fill under the
// outer variant's text colour (white on mustard).
export const GitHubButton: FC<GitHubButtonProps> = ({ github, display }) => {
    const iconOnly = useBreakpointValue({ base: true, lg: false });
    if (!github) return null;
    const props = {
        variant: "secondary",
        py: "5",
        display,
        "aria-label": "GitHub",
        "data-cursor": "Code",
        onClick: () => open(github),
        ...buttonHover,
    };
    return iconOnly ? (
        <IconButton {...props} icon={<GitHubIcon />} />
    ) : (
        <Button {...props} leftIcon={<GitHubIcon />}>
            GitHub
        </Button>
    );
};

export const LiveDemo: FC<LiveDemoProps> = ({ demo, display }) => {
    const iconOnly = useBreakpointValue({ base: true, lg: false });
    if (!demo) return null;
    const props = {
        display,
        "aria-label": "Live demo",
        "data-cursor": "Open",
        onClick: () => open(demo),
        ...buttonHover,
    };
    return iconOnly ? (
        <IconButton {...props} icon={<LinkIcon fontSize="14pt" />} />
    ) : (
        <Button {...props} leftIcon={<LinkIcon fontSize="14pt" />}>
            Live demo
        </Button>
    );
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
