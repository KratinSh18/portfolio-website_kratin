import { FC, PointerEvent } from "react";

import { Box, Flex, Text } from "@chakra-ui/react";

import { configs, Content, MarkdownFile, useContent, withProduct } from "shared/content/Content";
import { Education } from "pages/about/education/Education";
import { Skills } from "pages/about/skills/Skills";
import { SoonBadge } from "pages/about/common/fx/SoonBadge";
import { Float3D } from "shared/motion/Float3D";
import { SplitText } from "shared/motion/SplitText";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";

import "pages/about/About.scss";

// Tilt + glare follow the pointer through CSS variables (no React state).
const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch on a hybrid laptop is not a hover
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
};

const untilt = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
};

export const About: FC = () => {
    const content = useContent(MarkdownFile.About);
    const desktop = useIsDesktopPointer();
    const reduced = useReducedMotion();
    const tiltable = desktop && !reduced;
    const { name, pronunciation, mainPicture } = configs.common;

    return (
        <Box className="abt">
            <span className="abt__watermark" aria-hidden="true">
                About
            </span>

            <Float3D direction="up">
                <Flex
                    className="abt__intro"
                    pt="8"
                    gap={{ base: 10, md: 10, lg: 16 }}
                    direction={{ base: "column", md: "row" }}
                    alignItems={{ base: "stretch", md: "center" }}
                >
                    <Box flex="0.38" className="abt__photo-wrap">
                        <span className="fx-halo" aria-hidden="true" />
                        <div
                            className={`abt__photo${tiltable ? " is-tilt" : ""}`}
                            onPointerMove={tiltable ? tilt : undefined}
                            onPointerLeave={tiltable ? untilt : undefined}
                        >
                            <img src={mainPicture} alt={`Portrait of ${name}`} width={1280} height={1600} />
                            <span className="abt__duo" aria-hidden="true" />
                            <span className="abt__glare" aria-hidden="true" />
                        </div>
                    </Box>

                    <Box flex="0.82" minW="0">
                        <Text className="fx-mono abt__eyebrow">Hello, I'm</Text>
                        <SplitText text={name} by="chars" as="h3" className="abt__name" />
                        {pronunciation && (
                            <Text fontWeight="bold" opacity="0.5">
                                {pronunciation}
                            </Text>
                        )}
                        <ul className="abt__tagline">
                            {configs.about.tagline.map((line) => (
                                <li className="fx-chip" key={line}>
                                    {withProduct(line)}
                                    {line.includes("{product}") && <SoonBadge />}
                                </li>
                            ))}
                        </ul>
                        <Box pt="6">
                            <Content fontSize="lg" lineHeight="1.75">
                                {content.about}
                            </Content>
                        </Box>
                    </Box>
                </Flex>
            </Float3D>

            <Float3D direction="up">
                <Box mt="24" className="abt__block">
                    <Education />
                </Box>
            </Float3D>

            {/* no Float3D: the skill panels run their own staggered entrance */}
            <Box pt="20" className="abt__block">
                <Skills />
            </Box>
        </Box>
    );
};
