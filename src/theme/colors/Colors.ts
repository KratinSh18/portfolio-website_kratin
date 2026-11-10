import { ColorHues } from "@chakra-ui/react";

/**
 * PlayOshi lime, sampled from its mark (300 = the brand lime, 500 = its deep
 * green). Text slots: 100-300 read on the dark page, 600+ on white (600 is
 * 7:1). Lime fills carry near-black text, never white.
 */
export const PrimaryColors: ColorHues = {
    50: "#F6FDE0",
    100: "#E8FBA8",
    200: "#D4F75C",
    300: "#C5F41F",
    400: "#A0D712",
    500: "#70B000",
    600: "#3F6212",
    700: "#365314",
    800: "#2B4510",
    900: "#1A2E05",
};

// Neutral greys down to PlayOshi black (no blue cast next to the lime).
export const PrimaryDarkColors: ColorHues = {
    50: "#F6F7F5",
    100: "#ECEEEA",
    200: "#DCDFDA",
    300: "#C2C6BF",
    400: "#8A8F87",
    500: "#696E66",
    600: "#4A4E47",
    700: "#2B2E29",
    800: "#161815",
    900: "#0A0B0A",
};
