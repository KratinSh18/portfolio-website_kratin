import { ThemeConfig, extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

import { PrimaryColors, PrimaryDarkColors } from "theme/colors/Colors";
import { components } from "theme/component-styles/ComponentStyles";

const config: ThemeConfig = {
    cssVarPrefix: "hp",
    // Dark-first immersive experience — the whole "liquid cyber" look assumes a
    // near-black canvas so the neon and the water background can glow.
    initialColorMode: "dark",
    useSystemColorMode: false,
};

const fonts = {
    body: "'Urbanist', sans-serif",
    heading: "'Playfair Display', serif;",
};

const colors = {
    primary: {
        ...PrimaryColors,
    },
    gray: {
        ...PrimaryDarkColors,
    },
};

export const bgLight = "white";
export const bgDark = "gray.800";
export const NavbarHeight = "144px";

const styles = {
    // The page background/text colour is driven by the `chakra-ui-light/dark`
    // body classes in index.scss (deterministic specificity), so the light/dark
    // toggle is reliable. Here we only set the selection highlight.
    global: {
        "*::selection": {
            background: "rgba(221,0,4,0.28)",
        },
    },
};

export const theme = extendTheme(
    {
        config,
        colors,
        fonts,
        styles,
        components,
    },
    withDefaultColorScheme({ colorScheme: "primary" }),
);
