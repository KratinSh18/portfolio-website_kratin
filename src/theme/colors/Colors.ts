import { ColorHues } from "@chakra-ui/react";

/**
 * Warm stone: cream (100) down to charcoal (900). The site is monochrome; lime
 * belongs to the PlayOshi section only (its own tokens in fx.scss). Text
 * slots: 50-300 read on the dark page, 600+ on paper. Cream fills carry
 * near-black text, charcoal fills carry paper.
 */
export const PrimaryColors: ColorHues = {
    50: "#FAF8F3",
    100: "#F2E8D5",
    200: "#E4D9C4",
    300: "#CFC4AF",
    400: "#A8A39A",
    500: "#7D786F",
    600: "#5F5B54",
    700: "#3A3834",
    800: "#26241F",
    900: "#1C1C1A",
};

// Neutral greys down to PlayOshi black (no blue cast next to the warm stone).
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
