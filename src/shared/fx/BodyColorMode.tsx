import { FC, useEffect } from "react";

import { useColorMode } from "@chakra-ui/react";

const TOKENS = {
    dark: { bg: "#0c0e13", color: "rgba(255,255,255,0.92)" },
    light: { bg: "#f6f7f9", color: "#1a1f29" },
};

/**
 * Drives the page (html/body) background + text colour straight from Chakra's
 * reactive color mode using inline `!important`. This sidesteps a Chakra v1
 * emotion quirk where the global body `background` could get stuck on one mode,
 * and guarantees the light/dark toggle always repaints the page base.
 */
export const BodyColorMode: FC = () => {
    const { colorMode } = useColorMode();

    useEffect(() => {
        const t = TOKENS[colorMode === "light" ? "light" : "dark"];
        const targets = [document.body, document.documentElement];
        targets.forEach((el) => {
            // `transition: none` so the base page colour switches instantly — a
            // paused transition (e.g. on a backgrounded tab) can otherwise strand
            // the body on the previous mode's colour.
            el.style.setProperty("transition", "none", "important");
            el.style.setProperty("background-color", t.bg, "important");
        });
        document.body.style.setProperty("color", t.color, "important");
    }, [colorMode]);

    return null;
};
