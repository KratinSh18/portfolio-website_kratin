import { FC } from "react";

import { Box, Button, Container, Flex, HStack, useColorModeValue } from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { LogoType } from "shared/navbar/logo-type/LogoType";
import { onResumeOpen } from "utils/Functions";
import { AboutPageId, useScroll, WorkPageId } from "utils/useScroll";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { MenuDrawer } from "./drawer/Drawer";
import { ColorModeButton } from "shared/color-mode-button/ColorModeButton";

export const Navbar: FC = () => {
    const navItemColor = useColorModeValue("gray.800", "white");
    const navBg = useColorModeValue("rgba(246, 247, 249, 0.7)", "rgba(12, 14, 19, 0.6)");
    const navBorder = useColorModeValue("rgba(15,23,42,0.08)", "rgba(255,255,255,0.08)");
    const navShadow = useColorModeValue("0 8px 30px rgba(15,23,42,0.08)", "0 8px 30px rgba(0,0,0,0.35)");
    const currentPage = useScroll();
    const reduced = useReducedMotion();

    const toSection = (section: string) => {
        document.getElementById(section)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };

    return (
        <Box
            position="fixed"
            top="0"
            w="100%"
            left="50%"
            transform="translate(-50%)"
            zIndex="20"
            bg={navBg}
            borderBottom="1px solid"
            borderColor={navBorder}
            boxShadow={navShadow}
            overflowX="clip"
            sx={{ backdropFilter: "blur(14px) saturate(140%)", WebkitBackdropFilter: "blur(14px) saturate(140%)" }}
        >
            <Container py="4" px="4">
                <Flex justifyContent="space-between" alignItems="center">
                    <LogoType text={configs.common.logoType} />
                    <Flex alignItems="center" display={{ base: "none", md: "flex" }}>
                        <HStack spacing="8" mr="6">
                            <Button
                                variant="link"
                                color={navItemColor}
                                textDecoration="underline"
                                textDecorationThickness="2px"
                                textDecorationColor={currentPage === WorkPageId ? "primary.500" : "transparent"}
                                onClick={() => toSection(WorkPageId)}
                            >
                                Work
                            </Button>
                            <Button
                                variant="link"
                                color={navItemColor}
                                textDecoration={currentPage === AboutPageId ? "underline" : "none"}
                                textDecorationThickness="2px"
                                textDecorationColor="primary.500"
                                onClick={() => toSection(AboutPageId)}
                            >
                                About
                            </Button>
                            <Button variant="link" onClick={onResumeOpen}>
                                Resume
                            </Button>
                        </HStack>
                        <ColorModeButton />
                    </Flex>

                    <MenuDrawer
                        currentPage={currentPage}
                        onSectionClick={toSection}
                        display={{ base: "block", md: "none" }}
                    />
                </Flex>
            </Container>
        </Box>
    );
};
