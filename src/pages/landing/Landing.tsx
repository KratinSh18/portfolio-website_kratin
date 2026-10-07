import { AnimationEvent, FC, PointerEvent, useEffect, useRef } from "react";

import { Button, VisuallyHidden } from "@chakra-ui/react";
import { motion, useSpring, useTransform } from "framer-motion";

import { Content, configs, useContent, MarkdownFile } from "shared/content/Content";
import { Socials } from "shared/socials/Socials";
import { SplitText } from "shared/motion/SplitText";
import { Magnetic } from "shared/motion/Magnetic";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { usePreloaderDone } from "shared/fx/preloader-state";
import { KukuPlayShowcaseId, WorkPageId } from "utils/useScroll";
import { onResumeOpen } from "utils/Functions";
import { ArrowRightIcon } from "utils/Icons";

import "pages/landing/Landing.scss";

const SPRING = { type: "spring", stiffness: 140, damping: 18 };
const ROLE_MS = 2200;

const rise = {
    hidden: { opacity: 0, y: 28 },
    shown: (delay: number) => ({ opacity: 1, y: 0, transition: { ...SPRING, delay } }),
};

interface RiseProps {
    play: boolean;
    delay: number;
    className?: string;
}

/** Above-the-fold entrance held until the preloader lifts; plain div under reduced motion. */
const Rise: FC<RiseProps> = ({ play, delay, className, children }) => {
    const reduced = useReducedMotion();

    if (reduced) return <div className={className}>{children}</div>;

    return (
        <motion.div
            className={className}
            variants={rise}
            custom={delay}
            initial="hidden"
            animate={play ? "shown" : "hidden"}
        >
            {children}
        </motion.div>
    );
};

export const Landing: FC = () => {
    const content = useContent(MarkdownFile.Landing);
    const reduced = useReducedMotion();
    const desktop = useIsDesktopPointer();
    const done = usePreloaderDone();
    const { product, landing } = configs;
    const tilt = desktop && !reduced;

    const rootRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLSpanElement>(null);
    const onScreen = useRef(true);

    // Portrait tilt: springs fed straight from pointer events — no React state.
    const rotateX = useSpring(0, { stiffness: 120, damping: 18 });
    const rotateY = useSpring(0, { stiffness: 120, damping: 18 });
    const glowX = useTransform(rotateY, (v) => v * -2.2);
    const glowY = useTransform(rotateX, (v) => v * 2.2);

    // Off-screen, every CSS loop in the hero (sheen, blob, ring, cue) is paused.
    useEffect(() => {
        const el = rootRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(([entry]) => {
            onScreen.current = entry.isIntersecting;
            el.classList.toggle("is-paused", !entry.isIntersecting);
        });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Role slot: steps a CSS transition on the track; the cloned first phrase at
    // the end lets it snap back to 0 invisibly, so the flip never runs backwards.
    useEffect(() => {
        const track = trackRef.current;
        const count = landing.roles.length;
        // wait for the preloader so the line rises in on the first phrase, not mid-cycle
        if (!track || reduced || !done || count < 2) return;
        let i = 0;
        const place = () => {
            track.style.transform = `translateY(${(-i * 100) / (count + 1)}%)`;
        };
        const id = window.setInterval(() => {
            if (document.hidden || !onScreen.current) return;
            i += 1;
            track.style.transition = "";
            place();
        }, ROLE_MS);
        const onEnd = () => {
            if (i < count) return;
            i = 0;
            track.style.transition = "none";
            place();
        };
        track.addEventListener("transitionend", onEnd);
        return () => {
            window.clearInterval(id);
            track.removeEventListener("transitionend", onEnd);
            i = 0;
            track.style.transition = "none";
            place();
        };
    }, [reduced, done, landing.roles.length]);

    const goShowcase = () => {
        const el = document.getElementById(KukuPlayShowcaseId) || document.getElementById(WorkPageId);
        if (!el) return;
        // html has `scroll-behavior: smooth`, which would override behavior:"auto".
        const html = document.documentElement;
        if (reduced) html.style.scrollBehavior = "auto";
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        if (reduced) html.style.scrollBehavior = "";
    };

    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
        if (!tilt) return;
        rotateY.set((e.clientX / window.innerWidth - 0.5) * 14);
        rotateX.set((0.5 - e.clientY / window.innerHeight) * 10);
    };
    const onPointerLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    // Per-letter jelly via delegation: the class goes on the letter's mask (so the
    // stretch is not clipped) and comes off when the one-shot animation ends.
    const onNameOver = (e: PointerEvent<HTMLElement>) => {
        if (!tilt || !done) return;
        const mask = (e.target as HTMLElement).closest(".split__mask");
        if (mask) mask.classList.add("is-jelly");
    };
    const onNameAnimEnd = (e: AnimationEvent<HTMLElement>) => {
        if (e.animationName !== "heroJelly") return;
        (e.target as HTMLElement).closest(".split__mask")?.classList.remove("is-jelly");
    };

    return (
        <section
            ref={rootRef}
            id="page-landing"
            className="hero"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
        >
            <div className="hero__grid">
                <div className="hero__text">
                    <Rise play={done} delay={0} className="hero__kicker fx-mono">
                        <span className="hero__dot" aria-hidden="true" />
                        Hello, I&apos;m
                    </Rise>

                    <h1
                        className={`hero__name${reduced ? " hero__name--static" : ""}`}
                        aria-label="Kratin Sharma"
                        onPointerOver={onNameOver}
                        onAnimationEnd={onNameAnimEnd}
                    >
                        <SplitText
                            text="Kratin"
                            by="chars"
                            appear
                            play={done}
                            delay={0.1}
                            stagger={0.05}
                            className="hero__line hero__line--solid"
                        />
                        <SplitText
                            text="Sharma"
                            by="chars"
                            appear
                            play={done}
                            delay={0.32}
                            stagger={0.05}
                            className="hero__line hero__line--outline"
                        />
                    </h1>

                    <Rise play={done} delay={0.6}>
                        <p className="hero__role">
                            <VisuallyHidden>I build {landing.roles.join(", ")}.</VisuallyHidden>
                            <span aria-hidden="true">
                                <span className="hero__role-lead">I build </span>
                                <span className="hero__slot">
                                    <span className="hero__slot-track" ref={trackRef}>
                                        {landing.roles.concat(landing.roles.slice(0, 1)).map((role, i) => (
                                            <span key={i}>{role}</span>
                                        ))}
                                    </span>
                                </span>
                            </span>
                        </p>
                    </Rise>

                    <Rise play={done} delay={0.7} className="hero__statement">
                        <Content fontSize={{ base: "md", md: "lg" }}>{content.landing}</Content>
                    </Rise>

                    <Rise play={done} delay={0.8} className="hero__creds">
                        {landing.credentials.map((c) => (
                            <span className="fx-chip" key={c}>
                                {c}
                            </span>
                        ))}
                    </Rise>

                    <Rise play={done} delay={0.9} className="hero__ctas">
                        <Magnetic>
                            <Button
                                data-cursor="Go"
                                onClick={goShowcase}
                                rightIcon={<ArrowRightIcon />}
                                h="52px"
                                px="7"
                                borderRadius="full"
                                bg="var(--fx-accent)"
                                color="white"
                                fontWeight="800"
                                className="hero__cta"
                                // stays on --fx-accent: white on accent-bright is ~4.1:1, under AA for 16px text
                                _hover={{ bg: "var(--fx-accent)", boxShadow: "var(--fx-glow-accent)" }}
                                _active={{ bg: "var(--fx-accent)", transform: "scale(0.96)" }}
                            >
                                See {product.name}
                                {product.showNextName && (
                                    <span className="hero__soon">soon {product.nextName}</span>
                                )}
                            </Button>
                        </Magnetic>
                        <Magnetic strength={0.25}>
                            <Button
                                data-cursor="Open"
                                onClick={onResumeOpen}
                                variant="outline"
                                h="52px"
                                px="7"
                                borderRadius="full"
                                bg="var(--fx-glass)"
                                color="inherit"
                                borderColor="var(--fx-glass-border)"
                                fontWeight="700"
                                _hover={{ borderColor: "var(--fx-glass-border-hot)", bg: "var(--fx-glass-strong)" }}
                                _active={{ transform: "scale(0.96)" }}
                            >
                                Resume
                            </Button>
                        </Magnetic>
                        <Socials resume={false} />
                    </Rise>
                </div>

                <motion.div
                    className="hero__portrait"
                    initial={reduced ? false : { opacity: 0, scale: 0.86, y: 30 }}
                    animate={done || reduced ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.86, y: 30 }}
                    transition={{ ...SPRING, delay: 0.25 }}
                >
                    <motion.div
                        className="hero__tilt"
                        style={tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
                    >
                        <motion.div
                            className="hero__glow"
                            aria-hidden="true"
                            style={tilt ? { x: glowX, y: glowY } : undefined}
                        />
                        <div className="hero__blob">
                            <picture>
                                <source type="image/webp" srcSet={landing.picture} />
                                <source type="image/jpeg" srcSet={landing.jpg} />
                                <img src={landing.jpg} alt="Portrait of Kratin Sharma" width={1080} height={1440} />
                            </picture>
                        </div>
                        <svg className="hero__ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
                            <defs>
                                <path id="hero-ring-path" d="M 100,100 m -86,0 a 86,86 0 1,1 172,0 a 86,86 0 1,1 -172,0" />
                            </defs>
                            <text textLength={538} lengthAdjust="spacing">
                                <textPath href="#hero-ring-path">{landing.ring}</textPath>
                            </text>
                        </svg>
                    </motion.div>
                </motion.div>
            </div>

            <Rise play={done} delay={1.2} className="hero__cue-wrap">
                <button
                    type="button"
                    className="hero__cue"
                    onClick={goShowcase}
                    data-cursor="Go"
                    aria-label={`Scroll to ${product.name}`}
                >
                    <span className="fx-mono">Scroll</span>
                    <span className="hero__cue-line" aria-hidden="true" />
                </button>
            </Rise>
        </section>
    );
};
