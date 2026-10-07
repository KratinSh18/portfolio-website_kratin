import { FC, lazy, Suspense } from "react";

import { Box, Container, Center, Spinner } from "@chakra-ui/react";

import { Float3D } from "shared/motion/Float3D";
import { FluidBackground } from "shared/fx/FluidBackground";
import { BodyColorMode } from "shared/fx/BodyColorMode";
import { ScrollProgress } from "shared/fx/ScrollProgress";
import { Cursor } from "shared/fx/Cursor";
import { Preloader } from "shared/fx/Preloader";
import { AboutPageId, WorkPageId } from "utils/useScroll";

import "./App.scss";
// Shared primitives used only by lazy sections: pulled into the main chunk so their CSS
// isn't duplicated across section chunks in conflicting order (mini-css-extract warning).
import "shared/fx/Marquee.scss";
import "shared/motion/SplitText.scss";

const Navbar = lazy(() => import("shared/navbar/Navbar").then((module) => ({ default: module.Navbar })));
const Landing = lazy(() => import("pages/landing/Landing").then((module) => ({ default: module.Landing })));
const MarqueeBand = lazy(() =>
    import("pages/landing/MarqueeBand").then((module) => ({ default: module.MarqueeBand })),
);
const KukuPlayShowcase = lazy(() =>
    import("pages/kukuplay/KukuPlayShowcase").then((module) => ({ default: module.KukuPlayShowcase })),
);
const PageHeader = lazy(() =>
    import("shared/page-header/PageHeader").then((module) => ({ default: module.PageHeader })),
);
const Footer = lazy(() => import("shared/footer/Footer").then((module) => ({ default: module.Footer })));
const FeaturedProjects = lazy(() =>
    import("pages/featured-projects/FeaturedProjects").then((module) => ({
        default: module.FeaturedProjects,
    })),
);
const OtherProjects = lazy(() =>
    import("pages/other-projects/OtherProjects").then((module) => ({
        default: module.OtherProjects,
    })),
);
const ExperienceTimeline = lazy(() =>
    import("pages/about/experience/ExperienceTimeline").then((module) => ({
        default: module.ExperienceTimeline,
    })),
);
const About = lazy(() => import("pages/about/About").then((module) => ({ default: module.About })));

const Loader: FC = () => (
    <Center w="100%" h="100vh">
        <Spinner size="lg" color="primary.500" />
    </Center>
);

const px = { base: 6, md: 6, lg: 4 };

export const App: FC = () => {
    return (
        <>
            {/* Eager overlays sit outside Suspense so a slow chunk can't hide them:
                the intro plays over the spinner instead of waiting behind it (and
                losing to preloader-state's 2.5s ceiling). */}
            <Preloader />
            <BodyColorMode />
            <FluidBackground />
            <Cursor />
            <ScrollProgress />

            <Suspense fallback={<Loader />}>
                <Navbar />

                {/* Sections stack in normal flow (z-index above the fixed fluid canvas).
                    Full-bleed bands (marquee, product showcase) sit between the
                    max-width containers. The id boxes stay untransformed so offsetTop /
                    scrollIntoView / useScroll keep working. */}
                <Box position="relative" zIndex={1} overflowX="clip">
                    {/* 96px clears the floating nav pill (~82px) and keeps the hero above the fold on laptops */}
                    <Container px={px} pt="96px">
                        <Landing />
                    </Container>

                    <MarqueeBand />

                    <Box id={WorkPageId}>
                        <KukuPlayShowcase />

                        <Container px={px}>
                            <Float3D direction="up">
                                <PageHeader index="02" label="Work Experience" />
                            </Float3D>
                            <ExperienceTimeline />

                            <Float3D direction="up">
                                <PageHeader index="03" label="Featured Projects" />
                            </Float3D>
                            <FeaturedProjects />

                            <Float3D direction="up">
                                <PageHeader index="04" id="page-other-projects" label="Other Projects" />
                            </Float3D>
                            <OtherProjects />
                        </Container>
                    </Box>

                    <Container px={px}>
                        <Box id={AboutPageId}>
                            <Float3D direction="up">
                                <PageHeader index="05" label="About Me" />
                            </Float3D>
                            <About />
                        </Box>
                        <Footer />
                    </Container>
                </Box>
            </Suspense>
        </>
    );
};
