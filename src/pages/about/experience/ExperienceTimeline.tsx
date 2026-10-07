import { FC, MouseEvent, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import { configs, withProduct } from "shared/content/Content";
import { Magnetic } from "shared/motion/Magnetic";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { KukuPlayShowcaseId } from "utils/useScroll";
import { glare } from "pages/about/common/fx/glare";
import { SoonBadge } from "pages/about/common/fx/SoonBadge";
import { ChevronDownIcon } from "utils/Icons";

import "pages/about/experience/ExperienceTimeline.scss";

type Experience = typeof configs.about.experiences[number];

/** Bullets every card shows before "View all". */
const VISIBLE = 2;
/** The "pen": the spine is drawn down to this fraction of the viewport height. */
const PEN = 0.6;
/** Chakra "lg" — where the timeline zig-zags around a centred spine. */
const WIDE = "(min-width: 992px)";

const isWide = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(WIDE).matches;

interface ItemProps {
    exp: Experience;
    index: number;
    /** Read once: only decides which way a card sweeps in, so a resize mid-visit doesn't matter. */
    wide: boolean;
    reduced: boolean;
}

const TimelineItem: FC<ItemProps> = ({ exp, index, wide, reduced }) => {
    const [open, setOpen] = useState(false);
    const side = index % 2 === 0 ? "left" : "right";
    // The product is whatever mentions {product}: its mark and the deep-dive link
    // follow the token, so the rename never touches this file.
    const isProduct = exp.company.includes("{product}");
    const isNow = /present/i.test(exp.duration);
    const more = exp.description.slice(VISIBLE);
    const panelId = `xp-more-${exp.id}`;
    const dir = wide && side === "left" ? -1 : 1;

    // Sweep in from the card's own side, slightly rotated and out of focus.
    // Opacity and blur tween (a spring would overshoot blur below 0); filter is
    // cleared afterwards so the settled card never carries a filter.
    const entrance = reduced
        ? {}
        : {
              initial: { opacity: 0, x: (wide ? 90 : 40) * dir, rotate: 3 * dir, filter: "blur(10px)" },
              whileInView: {
                  opacity: 1,
                  x: 0,
                  rotate: 0,
                  filter: "blur(0px)",
                  transitionEnd: { filter: "none" },
              },
              viewport: { once: true, amount: 0.25 },
              transition: {
                  type: "spring",
                  stiffness: 140,
                  damping: 18,
                  opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  filter: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
          };

    const toShowcase = (e: MouseEvent<HTMLAnchorElement>) => {
        const target = document.getElementById(KukuPlayShowcaseId);
        if (!target) return; // no showcase on the page: let the plain hash link work
        e.preventDefault();
        // html has `scroll-behavior: smooth`, which would turn behavior:"auto" back into a glide
        const html = document.documentElement;
        if (reduced) html.style.scrollBehavior = "auto";
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        if (reduced) html.style.scrollBehavior = "";
    };

    return (
        <li className={`xptl__item xptl__item--${side}${isNow ? " is-now" : ""}`} data-xp-item>
            <span className="xptl__node" aria-hidden="true" />
            <span className="xptl__num" aria-hidden="true">{`0${index + 1}`}</span>

            {/* keyed on `reduced`: switching motion off mid-visit remounts the card
                instead of leaving it frozen at its hidden starting values */}
            <motion.article
                key={reduced ? "still" : "moving"}
                className={`xptl__card fx-glass${isProduct ? " xptl__card--product" : ""}`}
                onPointerMove={glare}
                {...entrance}
            >
                <div className="xptl__meta">
                    <span className="xptl__date fx-mono">{exp.duration}</span>
                    {isNow && (
                        <span className="xptl__now fx-mono">
                            <span className="xptl__now-dot" aria-hidden="true" />
                            Now
                        </span>
                    )}
                </div>

                <div className="xptl__head">
                    {isProduct && (
                        <img
                            className="xptl__mark"
                            src={configs.product.mark}
                            alt={`${configs.product.name} app icon`}
                            width={52}
                            height={52}
                            loading="lazy"
                        />
                    )}
                    <div>
                        <h3 className="xptl__company">
                            {withProduct(exp.company)}
                            {isProduct && <SoonBadge />}
                        </h3>
                        <p className="xptl__role">{withProduct(exp.position)}</p>
                    </div>
                </div>

                <ul className="xptl__points">
                    {exp.description.slice(0, VISIBLE).map((line, i) => (
                        <li key={i}>{withProduct(line)}</li>
                    ))}
                </ul>

                {more.length > 0 && (
                    <>
                        {/* grid-rows 0fr -> 1fr animates to the content's real height;
                            visibility keeps the collapsed points out of reach of
                            screen readers and find-in-page. */}
                        <div id={panelId} className={`xptl__more${open ? " is-open" : ""}`}>
                            <div>
                                <ul className="xptl__points">
                                    {more.map((line, i) => (
                                        <li key={i}>{withProduct(line)}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="xptl__toggle fx-mono"
                            aria-expanded={open}
                            aria-controls={panelId}
                            data-cursor={open ? "Close" : "Open"}
                            onClick={() => setOpen((o) => !o)}
                        >
                            {open ? "Show less" : `View all ${exp.description.length} points`}
                            <span className="xptl__chev" aria-hidden="true">
                                <ChevronDownIcon />
                            </span>
                        </button>
                    </>
                )}

                <div className="xptl__foot">
                    <ul className="xptl__tags" aria-label="Skills used">
                        {exp.tags.map((tag) => (
                            <li className="fx-chip" key={tag}>
                                {tag}
                            </li>
                        ))}
                    </ul>
                    {isProduct && (
                        <Magnetic strength={0.3}>
                            <a
                                className="xptl__dive fx-mono"
                                href={`#${KukuPlayShowcaseId}`}
                                onClick={toShowcase}
                                data-cursor="Go"
                                aria-label={`Deep dive into ${configs.product.name}`}
                            >
                                Deep dive <span aria-hidden="true">↑</span>
                            </a>
                        </Magnetic>
                    )}
                </div>
            </motion.article>
        </li>
    );
};

/**
 * Vertical, scroll-drawn work timeline. A spine fills crimson -> indigo as the
 * page scrolls; each role's node ignites when the fill reaches it and its glass
 * card sweeps in from its side (zig-zag on desktop, one rail on mobile).
 *
 * The fill is driven straight from the DOM: a passive, rAF-throttled scroll
 * listener (attached only while the timeline is on screen) writes the fill's
 * transform and toggles data-lit on each item — no React state per frame.
 * Reduced motion: spine fully drawn, every node lit, cards static.
 */
export const ExperienceTimeline: FC = () => {
    const experiences = configs.about.experiences;
    const reduced = useReducedMotion();
    const [wide] = useState(isWide);
    const rootRef = useRef<HTMLDivElement>(null);
    const spineRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const sparkRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const spine = spineRef.current;
        const fill = fillRef.current;
        const spark = sparkRef.current;
        if (!root || !spine || !fill || !spark) return;

        const items = Array.from(root.querySelectorAll<HTMLElement>("[data-xp-item]"));
        const nodes = items.map((el) => el.querySelector<HTMLElement>(".xptl__node"));

        if (reduced) {
            fill.style.transform = "scaleY(1)";
            items.forEach((el) => el.setAttribute("data-lit", ""));
            return;
        }

        let raf = 0;
        const draw = () => {
            raf = 0;
            // every read before any write, so a frame costs one layout, not one per node
            const r = spine.getBoundingClientRect();
            const marks = nodes.map((n) => (n ? n.getBoundingClientRect() : null));
            // unclamped: the first node sits at 0 and must stay dark until the pen reaches it
            const reach = window.innerHeight * PEN - r.top;
            const drawn = Math.min(Math.max(reach, 0), r.height);
            fill.style.transform = `scaleY(${r.height ? drawn / r.height : 0})`;
            spark.style.transform = `translate3d(-50%, ${drawn}px, 0)`;
            spark.style.opacity = reach > 0 && reach < r.height ? "1" : "0";
            items.forEach((el, i) => {
                const n = marks[i];
                el.toggleAttribute("data-lit", !!n && reach >= n.top + n.height / 2 - r.top - 1);
            });
        };
        const schedule = () => {
            if (!raf) raf = window.requestAnimationFrame(draw);
        };

        // Only listen to scroll while the timeline is visible; one last draw on
        // the way out leaves it fully drawn (scrolled past) or empty (above).
        let listening = false;
        const io = new IntersectionObserver((entries) => {
            // a fast fling can queue an enter and an exit together: the last one is current
            const entry = entries[entries.length - 1];
            schedule();
            if (entry.isIntersecting && !listening) {
                window.addEventListener("scroll", schedule, { passive: true });
                listening = true;
            } else if (!entry.isIntersecting && listening) {
                window.removeEventListener("scroll", schedule);
                listening = false;
            }
        });
        io.observe(root);
        // expanding a card changes the spine's length
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : undefined;
        ro?.observe(root);
        window.addEventListener("resize", schedule, { passive: true });

        return () => {
            io.disconnect();
            ro?.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            window.cancelAnimationFrame(raf);
        };
    }, [reduced]);

    return (
        <div ref={rootRef} className={`xptl${reduced ? " is-static" : ""}`}>
            <div ref={spineRef} className="xptl__spine" aria-hidden="true">
                <div ref={fillRef} className="xptl__fill" />
                <span ref={sparkRef} className="xptl__spark" />
            </div>

            <ol className="xptl__items" aria-label="Work experience">
                {experiences.map((exp, i) => (
                    <TimelineItem key={exp.id} exp={exp} index={i} wide={wide} reduced={reduced} />
                ))}
            </ol>
        </div>
    );
};
