import { FC, lazy, Suspense } from "react";

import { Box, Container, Center, Spinner } from "@chakra-ui/react";

import { NavbarHeight } from "theme";
import { Float3D } from "shared/motion/Float3D";
import { AuroraBackground } from "shared/fx/AuroraBackground";
import { BodyColorMode } from "shared/fx/BodyColorMode";
import { ScrollProgress } from "shared/fx/ScrollProgress";
import { AboutPageId, WorkPageId } from "utils/useScroll";

import "./App.scss";

const Navbar = lazy(() => import("shared/navbar/Navbar").then((module) => ({ default: module.Navbar })));
const Landing = lazy(() => import("pages/landing/Landing").then((module) => ({ default: module.Landing })));
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
    <Center w="100%" h="100%">
        <Spinner size="lg" color="primary.500" />
    </Center>
);

export const App: FC = () => {
    return (
        <Suspense fallback={<Loader />}>
            <BodyColorMode />
            <AuroraBackground />
            <ScrollProgress />
            <Container h="100%" px={{ base: 6, md: 6, lg: 4 }} position="relative" zIndex={1}>
                <Navbar />

                <Box mt={{ base: "96px", md: NavbarHeight }}>
                    <Landing />

                    {/* id boxes stay in normal flow and untransformed so offsetTop /
                        scrollIntoView / useScroll keep working. The pinned stage's
                        transforms live only on its inner pin / track / cards. */}
                    <Box id={WorkPageId}>
                        <Float3D direction="up">
                            <PageHeader label="Work Experience" />
                        </Float3D>
                        <ExperienceTimeline />

                        <Float3D direction="up">
                            <PageHeader label="Featured Projects" />
                        </Float3D>
                        <FeaturedProjects />

                        <Float3D direction="up">
                            <PageHeader id="page-other-projects" label="Other Projects" />
                        </Float3D>
                        <OtherProjects />
                    </Box>

                    <Box id={AboutPageId}>
                        <Float3D direction="up">
                            <PageHeader label="About Me" />
                        </Float3D>
                        <About />
                    </Box>
                </Box>
                <Footer />
            </Container>
        </Suspense>
    );
};
