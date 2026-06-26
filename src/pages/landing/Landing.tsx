import { FC } from "react";

import { Box, Button, Flex, Heading, HStack, Image, Stack, Text, useColorModeValue } from "@chakra-ui/react";

import { Content, configs, useContent, MarkdownFile } from "shared/content/Content";
import { Socials } from "shared/socials/Socials";
import { Float3D } from "shared/motion/Float3D";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { WorkPageId } from "utils/useScroll";
import { ChevronDownIcon, ArrowRightIcon } from "utils/Icons";

import "pages/landing/Landing.scss";

const CREDENTIALS = ["IIT Ropar", "Google Ads", "Performance Marketing"];

export const Landing: FC = () => {
    const content = useContent(MarkdownFile.Landing);
    const reduced = useReducedMotion();

    const subtle = useColorModeValue("gray.600", "whiteAlpha.800");

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };

    return (
        <Box id="page-landing" className="hero">
            <Flex
                direction={{ base: "column", lg: "row" }}
                align="center"
                justify="space-between"
                gap={{ base: 12, lg: 16 }}
                pt={{ base: 6, lg: 0 }}
                pb={{ base: 16, md: 24 }}
            >
                {/* ---- text column ---- */}
                <Stack flex={{ base: "1", lg: "0.62" }} spacing="7" order={{ base: 2, lg: 1 }}>
                    <Float3D direction="up" appear>
                        <HStack className="hero__kicker fx-mono" fontSize="xs" spacing="3">
                            <span className="dot" />
                            <Text as="span">Hello, I&apos;m</Text>
                        </HStack>
                    </Float3D>

                    <Float3D direction="up" appear delay={0.06}>
                        <Heading
                            className="hero__name"
                            fontSize={{ base: "5xl", md: "7xl" }}
                            lineHeight="0.98"
                            letterSpacing="-0.02em"
                            display="inline-block"
                        >
                            Kratin Sharma
                        </Heading>
                    </Float3D>

                    <Float3D direction="up" appear delay={0.12}>
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="600" color={subtle}>
                            Performance Marketing Manager at{" "}
                            <Box as="span" color="primary.400" fontWeight="700">
                                WoWTV · Kuku&nbsp;FM
                            </Box>
                        </Text>
                    </Float3D>

                    <Float3D direction="up" appear delay={0.18}>
                        <Box maxW="2xl" color={subtle}>
                            <Content fontSize={{ base: "md", md: "lg" }}>{content.landing}</Content>
                        </Box>
                    </Float3D>

                    <Float3D direction="up" appear delay={0.22}>
                        <Box className="hero__creds">
                            {CREDENTIALS.map((c) => (
                                <Box as="span" className="fx-chip" key={c} color={subtle} fontWeight="600">
                                    {c}
                                </Box>
                            ))}
                        </Box>
                    </Float3D>

                    <Float3D direction="up" appear delay={0.28}>
                        <HStack spacing="4" flexWrap="wrap">
                            <Button
                                rightIcon={<ArrowRightIcon />}
                                onClick={() => scrollTo(WorkPageId)}
                                px="7"
                                h="50px"
                                borderRadius="lg"
                                colorScheme="primary"
                                color="white"
                                fontWeight="700"
                                position="relative"
                                overflow="hidden"
                                transition="all 0.3s var(--fx-ease-out)"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "var(--fx-glow-accent)" }}
                                _active={{ transform: "translateY(0)" }}
                                sx={{
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                                        transform: "translateX(-130%)",
                                        transition: "transform 0.6s var(--fx-ease-out)",
                                    },
                                    "&:hover::after": { transform: "translateX(130%)" },
                                }}
                            >
                                View Work
                            </Button>
                        </HStack>
                    </Float3D>

                    <Float3D direction="up" appear delay={0.34}>
                        <Socials delay={0} resume={false} />
                    </Float3D>
                </Stack>

                {/* ---- portrait column ---- */}
                <Box flex={{ base: "1", lg: "0.38" }} order={{ base: 1, lg: 2 }} w="100%">
                    <Float3D direction="right" depth={0.7} appear delay={0.1} bob>
                        <Box className="hero__photo">
                            <Box className="fx-halo" />
                            <Box className="hero__frame fx-glass">
                                <Box className="hero__frame-inner">
                                    <picture>
                                        <source type="image/webp" srcSet={configs.landing.picture} />
                                        <source type="image/jpeg" srcSet={configs.landing.jpg} />
                                        <Image
                                            src={configs.landing.jpg}
                                            alt="Kratin Sharma"
                                            w="100%"
                                            display="block"
                                            borderRadius="1rem"
                                        />
                                    </picture>
                                </Box>
                            </Box>
                        </Box>
                    </Float3D>
                </Box>
            </Flex>

            <Flex justify="center">
                <Button
                    className="hero__cue"
                    aria-label="Scroll to work"
                    onClick={() => scrollTo(WorkPageId)}
                    variant="icon"
                    fontSize="3xl"
                    color={subtle}
                    _hover={{ color: "primary.400" }}
                >
                    <ChevronDownIcon />
                </Button>
            </Flex>
        </Box>
    );
};
