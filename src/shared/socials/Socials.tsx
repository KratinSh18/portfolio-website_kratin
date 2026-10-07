import { FC } from "react";

import { Button, HStack, IconButton, Tooltip } from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { onResumeOpen, open } from "utils/Functions";
import { FacebookIcon, GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon, YoutubeIcon } from "utils/Icons";

const LinksToIconMapper: Record<string, JSX.Element> = {
    linkedin: <LinkedInIcon />,
    github: <GitHubIcon />,
    facebook: <FacebookIcon />,
    instagram: <InstagramIcon />,
    youtube: <YoutubeIcon />,
    mail: <MailIcon />,
};

interface Props {
    resume?: boolean;
    exclude?: Array<string>;
    /** Kept for call-site compatibility; entrance timing is now owned by Float3D. */
    delay?: number;
}

// Springy lift + soft crimson glow; the overshoot curve settles once.
const hoverStyles = {
    transition: "color 0.3s var(--fx-ease-out), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease",
    _hover: { transform: "translateY(-3px)", filter: "drop-shadow(0 6px 14px rgba(221, 0, 4, 0.35))" },
    _active: { transform: "scale(0.92)" },
    sx: { "@media (prefers-reduced-motion: reduce)": { "&:hover, &:active": { transform: "none" } } },
};

export const Socials: FC<Props> = ({ resume = true, exclude }) => {
    return (
        <HStack spacing="5">
            {resume && (
                <Button size="lg" borderRadius="xl" mr="2" onClick={onResumeOpen} data-cursor="Open">
                    Resume
                </Button>
            )}
            {configs.common.socials.map(
                (social) =>
                    !exclude?.includes(social.type) && (
                        <Tooltip key={social.type} label={social.type} textTransform="capitalize">
                            <IconButton
                                p="0"
                                minW="40px"
                                h="40px"
                                aria-label={`Open ${social.type}`}
                                data-cursor="Open"
                                variant="icon"
                                fontSize={social.type === "mail" ? "24pt" : "20pt"}
                                icon={LinksToIconMapper[social.type]}
                                onClick={() => open(social.link)}
                                {...hoverStyles}
                            />
                        </Tooltip>
                    ),
            )}
        </HStack>
    );
};
