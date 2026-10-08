import { FC } from "react";

import { Box, Text, useBreakpointValue } from "@chakra-ui/react";

interface Props {
    text: {
        mobile: string;
        desktop: string;
    };
    onClick?: () => void;
}

/** The signature wordmark; a small ink-flick tilt on hover, a plain colour change under reduced motion. */
export const LogoType: FC<Props> = ({ text, onClick }) => {
    const variant = useBreakpointValue({ base: text.mobile, md: text.desktop });

    return (
        <Box
            as="button"
            type="button"
            onClick={onClick}
            aria-label={`${text.desktop}, back to top`}
            minH="40px"
            minW="40px"
            display="flex"
            alignItems="center"
            borderRadius="md"
            transition="color 0.3s var(--fx-ease-out), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)"
            _hover={{ color: "primary.500" }}
            _focusVisible={{ outline: "2px solid var(--fx-accent-bright)", outlineOffset: "4px" }}
            sx={{
                // hover-capable pointers only: a tap on touch would leave the tilt stuck
                "@media (hover: hover) and (prefers-reduced-motion: no-preference)": {
                    "&:hover": { transform: "rotate(-3deg) translateY(-1px)" },
                },
                // after the hover rule so the press shrink wins while held
                "@media (prefers-reduced-motion: no-preference)": { "&:active": { transform: "scale(0.96)" } },
            }}
        >
            <Text
                as="span"
                fontSize={{ base: "3xl", md: "4xl" }}
                lineHeight="1"
                fontFamily="Signature"
                mb={{ base: 0, md: -2 }}
            >
                {variant}
            </Text>
        </Box>
    );
};
