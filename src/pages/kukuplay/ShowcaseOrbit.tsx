import { CSSProperties, FC, useRef } from "react";

import { IconType } from "react-icons";
import { FaAndroid, FaApple, FaBrain, FaChartLine, FaCreditCard, FaPenNib, FaReact, FaShieldAlt } from "react-icons/fa";

import showcase from "content/kukuplay/showcase.json";
import { configs, withProduct } from "shared/content/Content";
import { usePauseOffscreen } from "shared/fx/usePauseOffscreen";

const chapterIcons: Record<string, IconType> = {
    engine: FaBrain,
    android: FaAndroid,
    ios: FaApple,
    web: FaReact,
    payments: FaCreditCard,
    growth: FaChartLine,
    studio: FaPenNib,
    safety: FaShieldAlt,
};

/** Chapter id (showcase.json) → icon; an unknown id still gets a node. */
export const iconFor = (id: string): IconType => chapterIcons[id] || FaBrain;

// Visual tuning, not content: radius as a fraction of the orbit size, one spin
// period each, alternating directions so the rings drift against each other.
// The rings share one tilted plane (--tx/--ty in the SCSS), so they never cross,
// and every chapter rides the outer ring, evenly spaced: no node can cover the
// core or another node at any angle (checked for orbit sizes 300–520px).
const RINGS = [
    { rf: 0.3, dur: 70, dir: "normal" },
    { rf: 0.43, dur: 95, dir: "reverse" },
];
const NODE_RING = RINGS.length - 1;
const OFFSET = 20; // first chapter's angle on the ring

interface Props {
    chapters: { id: string; title: string }[];
    /** Index of the lit chapter, or -1 for none (static layout). */
    active: number;
    /** Spinning, sticky desktop version; false = smaller and still. */
    live: boolean;
    onSelect: (index: number) => void;
}

/**
 * The product mark in a glowing core, circled by tilted rings with one node
 * per chapter. All motion is CSS transforms on HTML elements (the compositor):
 * each ring spins in the tilted plane and the nodes counter-rotate so the
 * icons always face the viewer. Chapters go round the ring in order, so DOM /
 * tab order matches the reading order of the cards.
 */
export const ShowcaseOrbit: FC<Props> = ({ chapters, active, live, onSelect }) => {
    const ref = useRef<HTMLDivElement>(null);

    // every loop (spin, glow, beam, ping) holds still while the orbit is off-screen
    usePauseOffscreen(ref);

    const angleOf = (i: number) => OFFSET + (360 / chapters.length) * i;

    return (
        <div
            ref={ref}
            className={`kp-orbit ${live ? "kp-orbit--live" : "kp-orbit--static"}`}
            role="group"
            aria-label={showcase.orbitLabel}
        >
            <span className="kp-orbit__glow" aria-hidden="true" />
            <div className="kp-orbit__stage">
                {RINGS.map((ring, r) => (
                    <div
                        key={r}
                        className="kp-orbit__ring"
                        style={{ "--rf": ring.rf, "--dur": `${ring.dur}s`, "--dir": ring.dir } as CSSProperties}
                    >
                        <svg className="kp-orbit__svg" viewBox="0 0 100 100" aria-hidden="true">
                            <circle className="kp-orbit__track" cx="50" cy="50" r="49" pathLength={100} />
                            <circle className="kp-orbit__arc" cx="50" cy="50" r="49" pathLength={100} />
                        </svg>

                        {r === NODE_RING && active >= 0 && (
                            <span
                                className="kp-orbit__beam"
                                style={{ "--a": `${angleOf(active)}deg` } as CSSProperties}
                                aria-hidden="true"
                            />
                        )}

                        {r === NODE_RING &&
                            chapters.map((chapter, i) => {
                                const Icon = iconFor(chapter.id);
                                const isActive = i === active;
                                return (
                                    <span
                                        key={chapter.id}
                                        className="kp-orbit__slot"
                                        style={{ "--a": `${angleOf(i)}deg` } as CSSProperties}
                                    >
                                        <button
                                            type="button"
                                            className={`kp-node${isActive ? " is-active" : ""}`}
                                            onClick={() => onSelect(i)}
                                            aria-label={`${showcase.chapterWord} ${i + 1}: ${withProduct(chapter.title)}`}
                                            aria-current={isActive ? "step" : undefined}
                                            data-cursor="Go"
                                        >
                                            <span className="kp-node__disc" aria-hidden="true">
                                                <Icon />
                                            </span>
                                        </button>
                                    </span>
                                );
                            })}
                    </div>
                ))}

                <span className="kp-orbit__core" aria-hidden="true">
                    <img src={configs.product.mark} alt="" width={160} height={160} />
                </span>
            </div>
        </div>
    );
};
