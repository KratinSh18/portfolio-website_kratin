import { FC, useEffect, useRef } from "react";

import { Box, Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";

import { configs } from "shared/content/Content";
import { LogoType } from "shared/navbar/logo-type/LogoType";
import { onResumeOpen } from "utils/Functions";
import { AboutPageId, useScroll, WorkPageId } from "utils/useScroll";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { Magnetic } from "shared/motion/Magnetic";
import { usePreloaderDone } from "shared/fx/preloader-state";
import { MenuDrawer } from "./drawer/Drawer";
import { ColorModeButton } from "shared/color-mode-button/ColorModeButton";

interface NavLinkProps {
    label: string;
    cursor: string;
    active?: boolean;
    reduced: boolean;
    onClick: () => void;
}

const NavLink: FC<NavLinkProps> = ({ label, cursor, active = false, reduced, onClick }) => {
    const color = useColorModeValue("gray.800", "white");

    return (
        <Magnetic strength={0.3}>
            <Box
                as="button"
                type="button"
                data-cursor={cursor}
                aria-current={active ? "true" : undefined}
                onClick={onClick}
                position="relative"
                h="40px"
                px="4"
                borderRadius="full"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.02em"
                color={active ? color : "var(--fx-text-soft)"}
                transition="color 0.3s var(--fx-ease-out)"
                _hover={{ color }}
                _focusVisible={{ outline: "2px solid var(--fx-accent-bright)", outlineOffset: "2px" }}
            >
                {/* One shared pill that glides between links (layoutId), instant under reduced motion. */}
                {active && (
                    <motion.span
                        layoutId="nav-active-pill"
                        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 999,
                            background: "var(--fx-accent-soft)",
                            border: "1px solid var(--fx-glass-border-hot)",
                        }}
                    />
                )}
                <Box as="span" position="relative">
                    {label}
                </Box>
            </Box>
        </Magnetic>
    );
};

export const Navbar: FC = () => {
    const barRef = useRef<HTMLDivElement>(null);
    const currentPage = useScroll();
    const reduced = useReducedMotion();
    // drop in once the preloader curtain lifts (at once under reduced motion)
    const ready = usePreloaderDone() || reduced;

    const toSection = (section: string) => {
        document.getElementById(section)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };
    const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

    // Condense / hide via data attributes written straight to the DOM from one
    // rAF-throttled listener — no React state, so scrolling never re-renders.
    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;

        let lastY = window.scrollY;
        let frame = 0;
        const update = () => {
            frame = 0;
            const y = window.scrollY;
            const dy = y - lastY;
            lastY = y;
            bar.dataset.condensed = String(y > 40);
            // Hide only on a quick downward fling, never near the top or under
            // reduced motion; any upward scroll brings it straight back.
            if (reduced || y < 160 || dy < -2) bar.dataset.hidden = "false";
            else if (dy > 14) bar.dataset.hidden = "true";
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.cancelAnimationFrame(frame);
        };
    }, [reduced]);

    return (
        <Box
            ref={barRef}
            as="header"
            data-ready={String(ready)}
            position="fixed"
            top="0"
            left="0"
            right="0"
            zIndex="20"
            px={{ base: 3, md: 4 }}
            pt={{ base: 3, md: 4 }}
            // the gutters around the pill must not swallow clicks on the page
            pointerEvents="none"
            transition="transform 0.5s var(--fx-ease-out)"
            sx={{
                // keyboard users tabbing into a hidden bar get it back
                "&[data-hidden='true']:not(:focus-within), &[data-ready='false']": { transform: "translateY(-130%)" },
                "&[data-condensed='true'] .nav-pill": {
                    maxW: "56rem",
                    py: { base: 1.5, md: 2 },
                    bg: "var(--fx-glass-strong)",
                },
                // the condense still happens, it just snaps instead of morphing
                "@media (prefers-reduced-motion: reduce)": { "&, & .nav-pill": { transition: "none" } },
            }}
        >
            <Flex
                className="nav-pill"
                pointerEvents="auto"
                mx="auto"
                maxW="container.xl"
                px={{ base: 4, md: 6 }}
                py={{ base: 2, md: 3 }}
                justifyContent="space-between"
                alignItems="center"
                borderRadius="full"
                bg="var(--fx-glass)"
                border="1px solid var(--fx-glass-border)"
                boxShadow="var(--fx-glass-shadow)"
                transition="max-width 0.6s var(--fx-ease-out), padding 0.6s var(--fx-ease-out), background-color 0.4s ease"
                sx={{ backdropFilter: "blur(16px) saturate(140%)", WebkitBackdropFilter: "blur(16px) saturate(140%)" }}
            >
                <LogoType text={configs.common.logoType} onClick={toTop} />

                <Flex as="nav" aria-label="Primary" alignItems="center" display={{ base: "none", md: "flex" }}>
                    <HStack spacing="1" mr="3">
                        <NavLink
                            label="Work"
                            cursor="Go"
                            active={currentPage === WorkPageId}
                            reduced={reduced}
                            onClick={() => toSection(WorkPageId)}
                        />
                        <NavLink
                            label="About"
                            cursor="Go"
                            active={currentPage === AboutPageId}
                            reduced={reduced}
                            onClick={() => toSection(AboutPageId)}
                        />
                        <NavLink label="Resume" cursor="Open" reduced={reduced} onClick={onResumeOpen} />
                    </HStack>
                    <Box w="1px" h="20px" bg="var(--fx-glass-border)" mr="2" />
                    <ColorModeButton />
                </Flex>

                <MenuDrawer
                    currentPage={currentPage}
                    onSectionClick={toSection}
                    display={{ base: "block", md: "none" }}
                />
            </Flex>
        </Box>
    );
};
