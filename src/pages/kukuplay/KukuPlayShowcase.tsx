import { FC, ReactNode, useEffect, useRef, useState } from "react";

import { Box, Container } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { IconType } from "react-icons";
import { FaAndroid, FaApple, FaArrowRight, FaGlobe, FaPenNib } from "react-icons/fa";

import showcase from "content/kukuplay/showcase.json";
import { configs, withProduct } from "shared/content/Content";
import { Marquee } from "shared/fx/Marquee";
import { usePauseOffscreen } from "shared/fx/usePauseOffscreen";
import { Float3D } from "shared/motion/Float3D";
import { Magnetic } from "shared/motion/Magnetic";
import { SplitText } from "shared/motion/SplitText";
import { useIsDesktopPointer } from "shared/motion/useIsDesktopPointer";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { PageHeader } from "shared/page-header/PageHeader";
import { PhoneMock } from "pages/kukuplay/PhoneMock";
import { ShowcaseOrbit, iconFor } from "pages/kukuplay/ShowcaseOrbit";
import { ShowcaseStats } from "pages/kukuplay/ShowcaseStats";
import { KukuPlayShowcaseId } from "utils/useScroll";

import "pages/kukuplay/KukuPlayShowcase.scss";

// re-exported: the id lives in utils/useScroll so main-bundle code can use it
export { KukuPlayShowcaseId };

type Chapter = typeof showcase.chapters[number];

const { product } = configs;
const host = product.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const platformIcons: Record<string, IconType> = { android: FaAndroid, ios: FaApple, web: FaGlobe, admin: FaPenNib };

/** Copy marks an accent phrase as _like this_ → Playfair italic. */
const accent = (text: string): ReactNode[] =>
    text.split("_").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));

const Intro: FC<{ reduced: boolean }> = ({ reduced }) => (
    <div className="kp-intro">
        <div className="kp-intro__top">
            <span className="kp-mark">
                <img src={product.mark} alt={withProduct(showcase.markAlt)} width={64} height={64} />
            </span>
            <div>
                <p className="kp-role fx-mono">
                    <span className="kp-spark" aria-hidden="true" />
                    {showcase.role}
                </p>
                <p className="kp-dates fx-mono">{showcase.dates}</p>
            </div>
        </div>

        <div className="kp-name-row">
            {/* gradient rides on each piece (background-clip breaks across masks);
                reduced motion renders plain text, so it goes on the wrapper then */}
            <SplitText
                text={product.name}
                by="chars"
                as="h2"
                className={`kp-name${reduced ? " kp-grad" : ""}`}
                pieceClassName="kp-grad"
                stagger={0.045}
            />
            {product.showNextName && (
                <span className="kp-soon fx-mono">
                    {showcase.soon} {product.nextName}
                </span>
            )}
        </div>

        <div className="kp-intro__grid">
            <Float3D direction="up" amount={0.15}>
                <p className="kp-tagline">{accent(withProduct(showcase.tagline))}</p>
                <p className="kp-copy">{withProduct(showcase.pitch)}</p>
                <p className="kp-copy">{withProduct(showcase.summary)}</p>

                <ul className="kp-platforms" aria-label={showcase.platformsLabel}>
                    {showcase.platforms.map((name) => {
                        const Icon = platformIcons[name.toLowerCase()];
                        return (
                            <li className="fx-chip" key={name}>
                                {Icon && <Icon aria-hidden="true" />}
                                {name}
                            </li>
                        );
                    })}
                </ul>

                <Magnetic strength={0.3}>
                    <a
                        className="kp-visit"
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="Open"
                    >
                        {showcase.visit} {host}
                        <FaArrowRight aria-hidden="true" />
                    </a>
                </Magnetic>
            </Float3D>

            <Float3D direction="right" depth={0.4} amount={0.15}>
                <PhoneMock />
            </Float3D>
        </div>
    </div>
);

const ChapterCard: FC<{ chapter: Chapter; index: number; total: number; lit: boolean }> = ({
    chapter,
    index,
    total,
    lit,
}) => {
    const Icon = iconFor(chapter.id);
    const titleId = `kp-chapter-${chapter.id}`;

    return (
        <article className={`kp-card fx-glass${lit ? " is-active" : ""}`} tabIndex={-1} aria-labelledby={titleId}>
            <header className="kp-card__head">
                <span className="kp-card__icon" aria-hidden="true">
                    <Icon />
                </span>
                <div>
                    <p className="kp-card__num fx-mono">
                        {pad(index + 1)} / {pad(total)} · {chapter.kicker}
                    </p>
                    <h3 className="kp-card__title" id={titleId}>
                        {withProduct(chapter.title)}
                    </h3>
                </div>
            </header>
            <p className="kp-card__summary">{withProduct(chapter.summary)}</p>
            <ul className="kp-card__list">
                {chapter.bullets.map((line, i) => (
                    <li key={i}>{withProduct(line)}</li>
                ))}
            </ul>
            <ul className="kp-card__tech" aria-label={showcase.techLabel}>
                {chapter.tech.map((t) => (
                    <li className="fx-chip" key={t}>
                        {t}
                    </li>
                ))}
            </ul>
        </article>
    );
};

/** Big title + counter under the orbit — a visual echo of the lit card, so hidden from screen readers. */
const NowShowing: FC<{ chapters: Chapter[]; active: number }> = ({ chapters, active }) => (
    <div className="kp-now" aria-hidden="true">
        <p className="kp-now__count fx-mono">
            {pad(active + 1)} / {pad(chapters.length)}
        </p>
        <div className="kp-now__stage">
            <AnimatePresence exitBeforeEnter initial={false}>
                <motion.p
                    key={active}
                    className="kp-now__title"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -28 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                    {withProduct(chapters[active].title)}
                </motion.p>
            </AnimatePresence>
        </div>
        <div className="kp-progress">
            {chapters.map((c, i) => (
                <span key={c.id} className={i <= active ? "is-on" : undefined} />
            ))}
        </div>
    </div>
);

/**
 * 01 / Now Building — the product case study. Desktop (fine pointer, motion
 * allowed) gets sticky scrollytelling: the orbit holds still on the left while
 * the chapter cards scroll past on the right, and whichever card crosses the
 * middle of the viewport lights its node. Touch and reduced motion get the
 * same content stacked, with a still orbit on top and no sticky.
 */
export const KukuPlayShowcase: FC = () => {
    const reduced = useReducedMotion();
    const desktop = useIsDesktopPointer();
    const scrolly = desktop && !reduced;
    const chapters = showcase.chapters;
    const [active, setActive] = useState(0);
    const steps = useRef<(HTMLDivElement | null)[]>([]);
    const sectionRef = useRef<HTMLDivElement>(null);
    // every loop in the section (role spark included) holds still while it is off-screen
    usePauseOffscreen(sectionRef);

    // A 10%-tall band across the middle of the viewport: the step inside it is
    // the active chapter. Fires only on crossings, so state changes ~8 times.
    useEffect(() => {
        if (!scrolly || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
                });
            },
            { rootMargin: "-45% 0px -45% 0px" },
        );
        steps.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, [scrolly]);

    const goTo = (i: number) => {
        const el = steps.current[i];
        if (!el) return;
        // centre = the scrolly band that lights the card; stacked cards can be taller
        // than a phone screen, so they align their top (under scroll-margin-top) instead
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: scrolly ? "center" : "start" });
        // move focus with the view so keyboard users land on the card they picked
        el.querySelector<HTMLElement>(".kp-card")?.focus({ preventScroll: true });
    };

    const step = (chapter: Chapter, i: number, body: ReactNode) => (
        <div
            className="kp-step"
            data-index={i}
            key={chapter.id}
            ref={(el) => {
                steps.current[i] = el;
            }}
        >
            {body}
        </div>
    );

    return (
        <Box ref={sectionRef} as="section" id={KukuPlayShowcaseId} className="kp" aria-label={`${product.name} — ${showcase.kicker}`}>
            <Container px={{ base: 6, md: 6, lg: 4 }}>
                <Float3D direction="up">
                    <PageHeader index="01" label={showcase.kicker} />
                </Float3D>

                <Intro reduced={reduced} />

                <ShowcaseStats stats={showcase.stats} label={showcase.statsLabel} />

                <p className="kp-label fx-mono">{showcase.chaptersLabel}</p>
                {scrolly ? (
                    <div className="kp-scrolly">
                        <div className="kp-sticky">
                            <ShowcaseOrbit chapters={chapters} active={active} live onSelect={goTo} />
                            <NowShowing chapters={chapters} active={active} />
                        </div>
                        <div className="kp-steps">
                            {chapters.map((c, i) =>
                                step(
                                    c,
                                    i,
                                    <ChapterCard chapter={c} index={i} total={chapters.length} lit={i === active} />,
                                ),
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="kp-stack">
                        <ShowcaseOrbit chapters={chapters} active={-1} live={false} onSelect={goTo} />
                        {chapters.map((c, i) =>
                            step(
                                c,
                                i,
                                <Float3D direction="up" depth={0.3} amount={0.12}>
                                    <ChapterCard chapter={c} index={i} total={chapters.length} lit />
                                </Float3D>,
                            ),
                        )}
                    </div>
                )}
            </Container>

            <Marquee className="kp-marquee" items={showcase.stack} speed={50} reverse separator="◆" />
        </Box>
    );
};
